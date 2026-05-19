import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

// OfflineSMS Phase 1 uses Firebase Email/Password auth — it has no native
// dependencies, builds cleanly under Gradle 8, and works in Expo Go.
// WhatsApp OTP (functions/) and SMS Phone Auth remain options for later
// phases when a dev build or Cloud Functions deploy is available.

export const EmailAuthService = {
  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email.trim(), password);
  },

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email.trim(), password);
  },

  sendReset(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email.trim());
  },
};
