'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signInWithGoogle as firebaseGoogleSignIn,
  signOutUser,
  setupRecaptcha,
  requestPhoneOtp,
  verifyPhoneOtp,
} from '../lib/firebase';
import { onAuthStateChanged, User, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error: string | null }>;
  requestPhoneCode: (phoneNumber: string, containerId: string) => Promise<{ confirmationResult: ConfirmationResult | null; error: string | null }>;
  confirmPhoneCode: (confirmationResult: ConfirmationResult | null, code: string, phoneNumber: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Vibecoder',
          email: fbUser.email,
          phone: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
        });
      } else {
        // Keep existing dev session if set manually
        setUser((prev) => (prev?.uid ? prev : null));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    // Check if live Firebase API keys are configured
    const isConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'mock-dev-api-key';

    if (isConfigured) {
      const { user: fbUser, error } = await firebaseGoogleSignIn();
      if (error) return { success: false, error };
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Google User',
          email: fbUser.email,
          phone: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
        });
        return { success: true, error: null };
      }
    }

    // Dev/Demo mode sign in
    setUser({
      uid: 'google-user-dev-123',
      displayName: 'Alex Vibecoder',
      email: 'alex.vibecoder@gmail.com',
      phone: null,
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    });
    return { success: true, error: null };
  };

  const requestPhoneCode = async (phoneNumber: string, containerId: string) => {
    const isConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'mock-dev-api-key';

    if (isConfigured) {
      const verifier = setupRecaptcha(containerId);
      if (!verifier) return { confirmationResult: null, error: 'reCAPTCHA setup failed' };
      return await requestPhoneOtp(phoneNumber, verifier);
    }

    // Dev mode returns mock confirmation
    return { confirmationResult: null, error: null };
  };

  const confirmPhoneCode = async (confirmationResult: ConfirmationResult | null, code: string, phoneNumber: string) => {
    if (confirmationResult) {
      const { user: fbUser, error } = await verifyPhoneOtp(confirmationResult, code);
      if (error) return { success: false, error };
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: 'Phone User',
          email: null,
          phone: fbUser.phoneNumber || phoneNumber,
          photoURL: null,
        });
        return { success: true, error: null };
      }
    }

    // Dev mode OTP verification
    setUser({
      uid: `phone-user-${phoneNumber.replace(/\D/g, '') || 'dev'}`,
      displayName: 'Phone User',
      email: null,
      phone: phoneNumber || '+1 555 019 2834',
      photoURL: null,
    });
    return { success: true, error: null };
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        requestPhoneCode,
        confirmPhoneCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
