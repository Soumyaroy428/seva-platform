'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Smartphone,
  Check,
  ShieldCheck
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { sendOtp, verifyOtp, login, register: passwordRegister } = useAuth();

  // Mode: Sign In vs Create Donor Account
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  // Authentication Method for Donors: Password (default) vs OTP
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');

  // OTP Flow States
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(0);

  // Form Fields
  const [identifierInput, setIdentifierInput] = useState(''); // Email or Mobile Number
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // OTP input refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRedirect = () => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    router.push('/donor');
  };

  // 1. Password Sign In / Registration for Donors
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (mode === 'signin') {
      const cleanIdentifier = identifierInput.trim();
      if (!cleanIdentifier) {
        setError('Please enter your registered email address or mobile number.');
        setLoading(false);
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        setLoading(false);
        return;
      }

      const res = await login(cleanIdentifier, password);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMessage('Welcome back! Redirecting to your Donor Impact Hub...');
        setTimeout(() => handleRedirect(), 500);
      } else {
        setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Invalid email, mobile number, or password.');
      }
    } else {
      // Create Donor Account
      if (!name.trim()) {
        setError('Full legal or preferred name is required for 80G tax receipts.');
        setLoading(false);
        return;
      }
      if (!emailInput.trim() || !emailInput.includes('@')) {
        setError('A valid email address is required for 80G tax receipt delivery.');
        setLoading(false);
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const res = await passwordRegister({
        name: name.trim(),
        email: emailInput.trim().toLowerCase(),
        password,
        role: 'donor',
        phone: phoneInput.trim()
      });
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMessage('Donor account created successfully! Accessing your portal...');
        setTimeout(() => handleRedirect(), 600);
      } else {
        setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Failed to create donor account.');
      }
    }
  };

  // 2. OTP Sign In Flow (Mobile / Email OTP for donors who prefer passwordless)
  const getEffectiveOtpIdentifier = () => {
    if (identifierType === 'phone') {
      const clean = phoneInput.trim();
      return clean.startsWith('+') ? clean : `+91 ${clean}`;
    }
    return emailInput.trim().toLowerCase();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const id = getEffectiveOtpIdentifier();
    if (identifierType === 'phone' && phoneInput.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (identifierType === 'email' && !emailInput.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const registerData = mode === 'register' ? {
      name,
      role: 'donor' as const,
      phone: identifierType === 'phone' ? id : phoneInput,
      email: identifierType === 'email' ? id : emailInput
    } : undefined;

    const res = await sendOtp(id, mode === 'register' ? 'register' : 'login', registerData);
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setCountdown(30);
      setSuccessMessage(res.message || `Verification code sent to ${id}`);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    } else {
      setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Failed to send OTP code.');
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const char = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasted) {
      const chars = pasted.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    const id = getEffectiveOtpIdentifier();
    const registerData = mode === 'register' ? {
      name,
      role: 'donor' as const,
      phone: identifierType === 'phone' ? id : phoneInput,
      email: identifierType === 'email' ? id : emailInput
    } : undefined;

    const res = await verifyOtp(id, fullCode, registerData);
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMessage('Verification successful! Accessing your Donor Portal...');
      setTimeout(() => handleRedirect(), 500);
    } else {
      setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Verification code is invalid or has expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand & Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform">
            <img src="/seva-logo.png" alt="SEVA Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">SEVA</span>
          <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded">सेवा</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>Donor Community Portal</span>
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {mode === 'signin' ? 'Donor Sign In' : 'Create Donor Account'}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Access your personal donation history, download official 80G tax receipts, and track your hunger relief impact.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200/80 space-y-6">
          {/* Mode Switch: Sign In vs Register */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setStep('input');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                mode === 'signin'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setStep('input');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                mode === 'register'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              New Supporter? Register
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{typeof error === 'string' ? error : (error as any)?.message || JSON.stringify(error)}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{typeof successMessage === 'string' ? successMessage : (successMessage as any)?.message || JSON.stringify(successMessage)}</span>
            </div>
          )}

          {/* FLOW 1: PASSWORD LOGIN (Default and Primary for Donors) */}
          {authMethod === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {mode === 'register' ? (
                /* Registration Fields */
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Printed on your official 80G Tax Exemption receipts.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (Optional for SMS)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{loading ? 'Creating Account...' : 'Complete Donor Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                /* Donor Sign In Fields: Email or Mobile + Password */
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email or Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifierInput}
                        onChange={(e) => setIdentifierInput(e.target.value)}
                        placeholder="Enter email or 10-digit mobile number"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{loading ? 'Authenticating...' : 'Sign In to Donor Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          ) : (
            /* FLOW 2: OTP LOGIN (For donors who prefer OTP code) */
            step === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Receive Verification Code Via</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIdentifierType('phone')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        identifierType === 'phone'
                          ? 'border-orange-500 bg-orange-50/80 text-orange-800 ring-2 ring-orange-400/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-orange-600" />
                      <span>Mobile Number</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdentifierType('email')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        identifierType === 'email'
                          ? 'border-orange-500 bg-orange-50/80 text-orange-800 ring-2 ring-orange-400/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span>Email Address</span>
                    </button>
                  </div>
                </div>

                {identifierType === 'phone' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registered Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Sending OTP...' : 'Send 6-Digit OTP Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3 py-0.5 rounded-full">
                    Enter Verification Code
                  </span>
                  <p className="text-xs text-slate-600 pt-1">
                    Enter the 6-digit verification code sent to:
                  </p>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {getEffectiveOtpIdentifier()}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>A secure 6-digit one-time code has been dispatched. Enter it below to verify.</span>
                </div>

                <div className="flex justify-center items-center gap-2 py-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 text-center text-xl font-mono font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify & Enter Donor Hub'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input');
                      setError('');
                    }}
                    className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Recipient</span>
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || loading}
                    onClick={handleSendOtp}
                    className={`font-semibold flex items-center gap-1 ${
                      countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-orange-600 hover:underline'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            )
          )}

          {/* Toggle between Password and OTP */}
          <div className="pt-4 border-t border-slate-100 text-center">
            {authMethod === 'password' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setStep('input');
                  setError('');
                }}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Prefer to sign in with OTP instead? Click here</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setError('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Switch back to password sign in</span>
              </button>
            )}
          </div>

          {/* Operations & CMS Staff Access Separation Notice */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Are you an authorized Administrator or Field Volunteer?
            </p>
            <Link
              href="/cms"
              className="mt-1 text-xs font-bold text-slate-800 hover:text-orange-600 inline-flex items-center gap-1"
            >
              <span>Access CMS Operations Login Desk</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xs font-bold text-slate-500">Loading Seva Donor Authentication...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
