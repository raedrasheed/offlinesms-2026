import {
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

// Web/Expo phone auth using Firebase JS SDK requires reCAPTCHA on web.
// For React Native, in production prefer @react-native-firebase/auth which handles
// phone auth natively. We expose a service abstraction so the implementation can be
// swapped without changing the UI layer.
export interface PhoneVerification {
  verificationId: string;
}

let currentVerification: PhoneVerification | null = null;
let currentConfirmation: ConfirmationResult | null = null;

export const PhoneAuthService = {
  /**
   * Start phone-number verification.
   * `recaptchaVerifier` is required on web/Expo Go; on a custom dev build with
   * native firebase you can pass `undefined`.
   */
  async sendCode(phoneNumber: string, recaptchaVerifier: any): Promise<void> {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
    currentVerification = { verificationId };
  },

  async confirmCode(code: string) {
    if (currentConfirmation) {
      return currentConfirmation.confirm(code);
    }
    if (!currentVerification) {
      throw new Error('No verification in progress. Request a code first.');
    }
    const credential = PhoneAuthProvider.credential(currentVerification.verificationId, code);
    return signInWithCredential(auth, credential);
  },

  reset() {
    currentVerification = null;
    currentConfirmation = null;
  },
};
