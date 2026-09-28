import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-dev-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'vibecode-prompt-opt.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vibecode-prompt-opt',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Singleton initialization
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Google sign-in failed' };
  }
}

export function setupRecaptcha(containerId: string) {
  if (typeof window === 'undefined') return null;
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
}

export async function requestPhoneOtp(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
  try {
    const confirmationResult: ConfirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    return { confirmationResult, error: null };
  } catch (err: any) {
    return { confirmationResult: null, error: err?.message || 'Failed to send OTP SMS' };
  }
}

export async function verifyPhoneOtp(confirmationResult: ConfirmationResult, code: string) {
  try {
    const userCredential = await confirmationResult.confirm(code);
    return { user: userCredential.user, error: null };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Invalid or expired OTP code' };
  }
}

export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Failed to sign out' };
  }
}
