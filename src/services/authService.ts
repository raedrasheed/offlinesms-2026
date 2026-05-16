import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, UserCredential } from 'firebase/auth';
import { auth, functions } from '@/firebase/config';

// OfflineSMS uses WhatsApp-only OTP. The flow is fully server-driven:
//   - `requestCode` → Cloud Function generates a code and sends it via the
//     Meta WhatsApp Cloud API.
//   - `verifyCode`  → Cloud Function returns a Firebase Custom Token; the
//     client exchanges it for an authenticated session.

interface RequestResponse {
  ok: boolean;
  expiresInSeconds: number;
}

interface VerifyResponse {
  token: string;
  uid: string;
}

const requestFn = httpsCallable<{ phoneNumber: string }, RequestResponse>(
  functions,
  'requestWhatsAppOtp',
);

const verifyFn = httpsCallable<{ phoneNumber: string; code: string }, VerifyResponse>(
  functions,
  'verifyWhatsAppOtp',
);

export const WhatsAppAuthService = {
  /** Send a 6-digit WhatsApp OTP to the given E.164 phone number. */
  async sendCode(phoneNumber: string): Promise<void> {
    await requestFn({ phoneNumber });
  },

  /** Verify the OTP and sign the user into Firebase Auth. */
  async confirmCode(phoneNumber: string, code: string): Promise<UserCredential> {
    const { data } = await verifyFn({ phoneNumber, code });
    return signInWithCustomToken(auth, data.token);
  },
};
