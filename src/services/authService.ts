import {
  PhoneAuthProvider,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

// OfflineSMS uses Firebase Phone Auth (SMS-based OTP) for sign-in.
// Phone auth on the JS SDK requires a reCAPTCHA verifier on every request;
// the verifier ref is rendered in PhoneLoginScreen via
// `FirebaseRecaptchaVerifierModal` from expo-firebase-recaptcha.
//
// Flow:
//   PhoneLoginScreen → sendCode(phone, recaptchaVerifier)
//                      → PhoneAuthProvider.verifyPhoneNumber()
//                      → SMS delivered by Firebase
//   OtpVerifyScreen  → confirmCode(code)
//                      → PhoneAuthProvider.credential() → signInWithCredential()

let verificationId: string | null = null;

export const PhoneAuthService = {
  /** Send an SMS verification code to the given E.164 phone number. */
  async sendCode(phoneNumber: string, recaptchaVerifier: any): Promise<void> {
    if (!recaptchaVerifier) {
      throw new Error('Recaptcha verifier not ready. Please try again in a moment.');
    }
    const provider = new PhoneAuthProvider(auth);
    verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  },

  /** Confirm the SMS code and sign the user into Firebase Auth. */
  async confirmCode(code: string): Promise<UserCredential> {
    if (!verificationId) {
      throw new Error('No verification in progress. Request a code first.');
    }
    const credential = PhoneAuthProvider.credential(verificationId, code);
    return signInWithCredential(auth, credential);
  },

  reset() {
    verificationId = null;
  },
};
