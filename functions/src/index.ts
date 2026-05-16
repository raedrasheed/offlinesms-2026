import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { createHash, randomInt } from 'crypto';

initializeApp();
const db = getFirestore();
const auth = getAuth();

/**
 * OfflineSMS WhatsApp OTP via Meta WhatsApp Cloud API.
 *
 * Flow:
 *   1. Client calls `requestWhatsAppOtp({ phoneNumber })`.
 *      - Function generates a 6-digit code, stores its SHA-256 hash in
 *        otpRequests/{phoneNumber} along with attempt counter + expiry.
 *      - Function sends the code through Meta WhatsApp Cloud API using a
 *        pre-approved authentication template.
 *   2. Client calls `verifyWhatsAppOtp({ phoneNumber, code })`.
 *      - Function compares hashes, enforces attempts/expiry.
 *      - On success it ensures a Firebase Auth user exists for that phone,
 *        mints a Custom Token, and returns it.
 *      - The client signs in with `signInWithCustomToken`.
 *
 * Required Firebase secrets (set via `firebase functions:secrets:set NAME`):
 *   - WHATSAPP_PHONE_NUMBER_ID   Meta sender phone number id (numeric).
 *   - WHATSAPP_ACCESS_TOKEN      Long-lived access token for the WA app.
 *   - WHATSAPP_TEMPLATE_NAME     Approved auth template name (default: otp_login).
 *   - WHATSAPP_TEMPLATE_LANG     Template language code (default: en_US).
 *   - WHATSAPP_API_VERSION       Graph API version (default: v20.0).
 *   - OTP_HASH_SECRET            Random server-side pepper for hashing codes.
 */

const PHONE_NUMBER_ID = defineSecret('WHATSAPP_PHONE_NUMBER_ID');
const ACCESS_TOKEN = defineSecret('WHATSAPP_ACCESS_TOKEN');
const TEMPLATE_NAME = defineSecret('WHATSAPP_TEMPLATE_NAME');
const TEMPLATE_LANG = defineSecret('WHATSAPP_TEMPLATE_LANG');
const API_VERSION = defineSecret('WHATSAPP_API_VERSION');
const HASH_SECRET = defineSecret('OTP_HASH_SECRET');

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

const E164 = /^\+[1-9]\d{6,14}$/;

const hashCode = (phone: string, code: string, pepper: string) =>
  createHash('sha256').update(`${phone}:${code}:${pepper}`).digest('hex');

const sendWhatsAppTemplate = async (params: {
  phoneNumber: string;
  code: string;
  phoneNumberId: string;
  accessToken: string;
  templateName: string;
  templateLang: string;
  apiVersion: string;
}) => {
  const url = `https://graph.facebook.com/${params.apiVersion}/${params.phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: params.phoneNumber.replace(/^\+/, ''),
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.templateLang },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: params.code }],
        },
        {
          // Meta requires button parameters on authentication templates.
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: params.code }],
        },
      ],
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    logger.error('WhatsApp API error', { status: res.status, body: errText });
    throw new HttpsError('internal', 'Could not send WhatsApp message.');
  }
};

export const requestWhatsAppOtp = onCall(
  {
    secrets: [PHONE_NUMBER_ID, ACCESS_TOKEN, TEMPLATE_NAME, TEMPLATE_LANG, API_VERSION, HASH_SECRET],
    region: 'us-central1',
  },
  async (request) => {
    const phoneNumber = String(request.data?.phoneNumber ?? '').trim();
    if (!E164.test(phoneNumber)) {
      throw new HttpsError('invalid-argument', 'phoneNumber must be E.164 (+15551234567).');
    }

    const ref = db.collection('otpRequests').doc(phoneNumber);
    const existing = await ref.get();
    const now = Date.now();
    if (existing.exists) {
      const data = existing.data()!;
      if (data.lastSentAt && now - data.lastSentAt < RESEND_COOLDOWN_MS) {
        throw new HttpsError('resource-exhausted', 'Please wait before requesting another code.');
      }
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = hashCode(phoneNumber, code, HASH_SECRET.value());

    await ref.set(
      {
        codeHash,
        expiresAt: now + CODE_TTL_MS,
        attempts: 0,
        lastSentAt: now,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );

    await sendWhatsAppTemplate({
      phoneNumber,
      code,
      phoneNumberId: PHONE_NUMBER_ID.value(),
      accessToken: ACCESS_TOKEN.value(),
      templateName: TEMPLATE_NAME.value() || 'otp_login',
      templateLang: TEMPLATE_LANG.value() || 'en_US',
      apiVersion: API_VERSION.value() || 'v20.0',
    });

    return { ok: true, expiresInSeconds: CODE_TTL_MS / 1000 };
  },
);

export const verifyWhatsAppOtp = onCall(
  {
    secrets: [HASH_SECRET],
    region: 'us-central1',
  },
  async (request) => {
    const phoneNumber = String(request.data?.phoneNumber ?? '').trim();
    const code = String(request.data?.code ?? '').trim();
    if (!E164.test(phoneNumber)) {
      throw new HttpsError('invalid-argument', 'Invalid phone number.');
    }
    if (!/^\d{4,8}$/.test(code)) {
      throw new HttpsError('invalid-argument', 'Invalid code.');
    }

    const ref = db.collection('otpRequests').doc(phoneNumber);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'No code requested for this number.');
    }
    const data = snap.data()!;
    const now = Date.now();

    if (data.expiresAt && now > data.expiresAt) {
      await ref.delete();
      throw new HttpsError('deadline-exceeded', 'Code expired. Request a new one.');
    }
    if ((data.attempts ?? 0) >= MAX_ATTEMPTS) {
      await ref.delete();
      throw new HttpsError('resource-exhausted', 'Too many attempts. Request a new code.');
    }

    const expected = data.codeHash as string;
    const candidate = hashCode(phoneNumber, code, HASH_SECRET.value());
    if (candidate !== expected) {
      await ref.update({ attempts: FieldValue.increment(1) });
      throw new HttpsError('permission-denied', 'Incorrect code.');
    }

    await ref.delete();

    let uid: string;
    try {
      const user = await auth.getUserByPhoneNumber(phoneNumber);
      uid = user.uid;
    } catch {
      const created = await auth.createUser({ phoneNumber });
      uid = created.uid;
    }

    const token = await auth.createCustomToken(uid, { provider: 'whatsapp' });
    return { token, uid };
  },
);
