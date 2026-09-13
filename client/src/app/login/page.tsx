'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  RotateCcw,
  Smartphone,
  Check
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const initialRoleParam = searchParams.get('role');

  const { sendOtp, verifyOtp, login, register: passwordRegister } = useAuth();

  // Mode and Authentication Method states
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [identifierType, setIdentifierType] = useState<'phone' | 'email'>('phone');

  // OTP Flow States
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeOtpPreview, setActiveOtpPreview] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Form Fields
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'volunteer' | 'admin'>('donor');
  const [area, setArea] = useState('Central District & Urban Kitchen');
  const [availability, setAvailability] = useState('Weekends');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Logistics & Packaging']);

  // Status & Quotas
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [quotas, setQuotas] = useState<any>(null);

  // OTP input refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch live quotas on mount
  useEffect(() => {
    fetch('/api/auth/quotas')
      .then(r => r.json())
      .then(d => { if (d.success && d.quotas) setQuotas(d.quotas); })
      .catch(() => {});

    if (initialRoleParam && ['donor', 'volunteer', 'admin'].includes(initialRoleParam)) {
      setRole(initialRoleParam as any);
    }
  }, [initialRoleParam]);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const availableSkillsList = [
    'Logistics & Packaging',
    'Driving & Vehicle Transit',
    'Food Inspection & Safety',
    'Emergency Relief Dispatch',
    'Crowd Management',
    'First Aid & Health'
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const getEffectiveIdentifier = () => {
    if (identifierType === 'phone') {
      const cleanPhone = phoneInput.trim();
      return cleanPhone.startsWith('+') ? cleanPhone : `+91 ${cleanPhone}`;
    }
    return emailInput.trim().toLowerCase();
  };

  const handleRedirect = (userRole: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (userRole === 'admin') {
      router.push('/admin');
    } else if (userRole === 'volunteer') {
      router.push('/volunteer');
    } else {
      router.push('/donor');
    }
  };

  // STEP 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const id = getEffectiveIdentifier();
    if (!id || (identifierType === 'phone' && phoneInput.replace(/\D/g, '').length < 10)) {
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
      role,
      phone: identifierType === 'phone' ? id : phoneInput,
      email: identifierType === 'email' ? id : emailInput,
      area: role === 'volunteer' ? area : undefined,
      skills: role === 'volunteer' ? selectedSkills : undefined,
      availability: role === 'volunteer' ? availability : undefined
    } : undefined;

    const res = await sendOtp(id, mode === 'register' ? 'register' : 'login', registerData);
    setLoading(false);

    if (res.success) {
      setStep('otp');
      setCountdown(30);
      setActiveOtpPreview(res.otpPreview || null);
      setSuccessMessage(res.message || `Verification code sent to ${id}`);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    } else {
      setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Failed to send OTP code.');
    }
  };

  // Auto-Fill OTP Helper for evaluator convenience
  const handleAutoFillOtp = (code: string) => {
    const chars = code.split('').slice(0, 6);
    setOtpDigits(chars);
    // Focus last input
    inputRefs.current[5]?.focus();
  };

  // Handle individual digit input
  const handleOtpDigitChange = (index: number, value: string) => {
    const char = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next input
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

  // STEP 2: Verify OTP
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
    const id = getEffectiveIdentifier();
    const registerData = mode === 'register' ? {
      name,
      role,
      phone: identifierType === 'phone' ? id : phoneInput,
      email: identifierType === 'email' ? id : emailInput,
      area: role === 'volunteer' ? area : undefined,
      skills: role === 'volunteer' ? selectedSkills : undefined,
      availability: role === 'volunteer' ? availability : undefined
    } : undefined;

    const res = await verifyOtp(id, fullCode, registerData);
    setLoading(false);

    if (res.success && res.user) {
      const userRole = res.user.role;
      setSuccessMessage('Verification successful! Accessing your portal...');
      setTimeout(() => handleRedirect(userRole), 600);
    } else {
      setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Verification code is invalid or has expired.');
    }
  };

  // Alternative Password Sign In (if user toggles to password mode)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (mode === 'signin') {
      const res = await login(emailInput, password);
      setLoading(false);
      if (res.success && res.user) {
        const userRole = res.user.role;
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => handleRedirect(userRole), 500);
      } else {
        setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Failed to login');
      }
    } else {
      const res = await passwordRegister({
        name,
        email: emailInput,
        password,
        role,
        phone: phoneInput,
        area: role === 'volunteer' ? area : undefined,
        skills: role === 'volunteer' ? selectedSkills : undefined,
        availability: role === 'volunteer' ? availability : undefined
      });
      setLoading(false);
      if (res.success && res.user) {
        const userRole = res.user.role;
        setSuccessMessage(res.message || 'Account registered successfully!');
        setTimeout(() => handleRedirect(userRole), 1000);
      } else {
        setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Failed to register');
      }
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
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {mode === 'signin' ? 'Sign In via OTP' : 'Create Account via OTP'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Instant passwordless access for <span className="font-semibold text-orange-600">Donors</span>, <span className="font-semibold text-emerald-600">Volunteers</span> & <span className="font-semibold text-slate-800">Admins</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200/80">
          {/* Sign In vs Register Switch */}
          <div className="flex border-b border-slate-200 mb-6">
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
              Sign In (OTP)
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
              Register Candidate
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{typeof error === 'string' ? error : (error as any)?.message || JSON.stringify(error)}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{typeof successMessage === 'string' ? successMessage : (successMessage as any)?.message || JSON.stringify(successMessage)}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* OTP AUTHENTICATION FLOW */}
          {/* ============================================================ */}
          {authMethod === 'otp' ? (
            step === 'input' ? (
              /* STEP 1: INPUT IDENTIFIER */
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Method selector: Mobile vs Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Channel</label>
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

                {/* Candidate Role Selector (in register mode) */}
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate Role</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('donor')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                            role === 'donor'
                              ? 'border-orange-500 bg-orange-50/80 text-orange-800 ring-2 ring-orange-400/20'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>Donor</span>
                          <span className="text-[9px] text-slate-400 font-normal">Open</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('volunteer')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                            role === 'volunteer'
                              ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-400/20'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Volunteer</span>
                          <span className={`text-[9px] font-mono ${quotas?.volunteers.isFull ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            {quotas ? `${quotas.volunteers.current}/${quotas.volunteers.max}` : '3/4'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('admin')}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                            role === 'admin'
                              ? 'border-purple-500 bg-purple-50/80 text-purple-800 ring-2 ring-purple-400/20'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin</span>
                          <span className={`text-[9px] font-mono ${quotas?.admins.isFull ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            {quotas ? `${quotas.admins.current}/${quotas.admins.max}` : '1/2'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {role === 'volunteer' && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Volunteer Limit ({quotas ? `${quotas.volunteers.current}/${quotas.volunteers.max}` : '3/4'}):</strong> Strict maximum 4 volunteers permitted. Approvals are vetted by Administrator.
                        </span>
                      </div>
                    )}

                    {role === 'admin' && (
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Admin Limit ({quotas ? `${quotas.admins.current}/${quotas.admins.max}` : '1/2'}):</strong> Maximum 2 platform administrators permitted. Admin gets master CRUD access over all 7 modules.
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Candidate Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your legal or preferred name"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Primary Input: Mobile or Email */}
                {identifierType === 'phone' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {mode === 'register' ? 'Mobile Number for OTP' : 'Registered Mobile Number'}
                    </label>
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
                        className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">A 6-digit verification code will be dispatched to this number.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {mode === 'register' ? 'Email Address for OTP' : 'Registered Email Address'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">A 6-digit verification code will be dispatched to this email.</p>
                  </div>
                )}

                {/* Volunteer extra fields in register mode */}
                {mode === 'register' && role === 'volunteer' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Operational Area</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="District or zone"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Skills</label>
                      <div className="flex flex-wrap gap-1.5">
                        {availableSkillsList.map(sk => (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => toggleSkill(sk)}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition-all ${
                              selectedSkills.includes(sk)
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {sk}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Dispatching OTP...' : 'Send Verification Code (OTP)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* STEP 2: ENTER 6-DIGIT OTP */
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3 py-0.5 rounded-full">
                    Enter Verification Code
                  </span>
                  <p className="text-xs text-slate-600 pt-1">
                    Enter the 6-digit verification code sent to:
                  </p>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {getEffectiveIdentifier()}
                  </p>
                </div>

                {/* Simulated SMS / Dispatch Notification for Evaluator Convenience */}
                {activeOtpPreview && (
                  <div className="p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black shrink-0">
                        OTP
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Security Verification Code:</span>
                        <span className="font-mono text-base font-black text-orange-600 tracking-wider">
                          {activeOtpPreview}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1.5">(Valid for 10 mins)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoFillOtp(activeOtpPreview)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Auto-Fill Code</span>
                    </button>
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-mono font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-400/30 outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying Code...' : 'Verify OTP & Enter Portal'}</span>
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
                    <span>Change {identifierType === 'phone' ? 'Number' : 'Email'}</span>
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
                    <span>{countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* PASSWORD FALLBACK FLOW */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                    placeholder="e.g. name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle between OTP and Password method */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            {authMethod === 'otp' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setError('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Use password login instead</span>
              </button>
            ) : (
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
                <span>Switch to OTP-based mobile & email login</span>
              </button>
            )}
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
        <p className="text-xs font-bold text-slate-500">Loading Seva Authentication...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
