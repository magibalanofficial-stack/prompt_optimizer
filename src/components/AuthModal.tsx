'use client';

import React, { useState } from 'react';
import { X, Phone, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, requestPhoneCode, confirmPhoneCode } = useAuth();

  const [authStep, setAuthStep] = useState<'options' | 'phone_entry' | 'otp_verify'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setLoading(false);
    setAuthStep('options');
    setPhoneNumber('');
    setOtpCode('');
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { success, error: err } = await loginWithGoogle();
    setLoading(false);

    if (success) {
      handleClose();
    } else {
      setError(err || 'Failed to sign in with Google.');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setError('Please enter a valid phone number (e.g. +1 555 019 2834)');
      return;
    }

    setLoading(true);
    setError(null);

    const { confirmationResult: confResult, error: err } = await requestPhoneCode(
      phoneNumber,
      'recaptcha-container'
    );

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setConfirmationResult(confResult);
    setAuthStep('otp_verify');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    const { success, error: err } = await confirmPhoneCode(
      confirmationResult,
      otpCode,
      phoneNumber
    );

    setLoading(false);

    if (success) {
      handleClose();
    } else {
      setError(err || 'Invalid or expired OTP code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 text-center mb-1">
          Welcome to Vibecode Optimizer
        </h3>
        <p className="text-xs text-zinc-500 text-center mb-5">
          Sign in to save your prompts to your private library across devices.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {authStep === 'options' && (
          <div className="space-y-3">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-all shadow-xs disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{loading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-400 uppercase font-semibold">
                or
              </span>
            </div>

            {/* Phone Login Button */}
            <button
              onClick={() => {
                setError(null);
                setAuthStep('phone_entry');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Continue with Phone Number (SMS OTP)</span>
            </button>
          </div>
        )}

        {authStep === 'phone_entry' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Phone Number (E.164 Format)
              </label>
              <input
                type="tel"
                placeholder="+1 555 019 2834"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthStep('options')}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Sending Code...' : 'Send 6-Digit Code'}</span>
              </button>
            </div>
          </form>
        )}

        {authStep === 'otp_verify' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-zinc-500">Enter code sent to {phoneNumber}</p>
            </div>

            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="w-full text-center tracking-widest text-lg font-mono font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthStep('phone_entry')}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
