'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sliders,
  KeyRound
} from 'lucide-react';

function CMSLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { login, logout } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setError('Please provide your operational email/mobile and password.');
      return;
    }

    setLoading(true);
    const res = await login(cleanId, password);
    setLoading(false);

    if (res.success && res.user) {
      const userRole = res.user.role;
      if (userRole === 'admin') {
        setSuccessMessage('Administrator authenticated. Launching Master Console...');
        setTimeout(() => router.push(redirectUrl || '/admin'), 500);
      } else if (userRole === 'volunteer') {
        setSuccessMessage(`Welcome, ${res.user.name}! Opening Volunteer Operations Hub...`);
        setTimeout(() => router.push(redirectUrl || '/volunteer'), 500);
      } else {
        setError('This portal is restricted to authorized Administrators and Field Volunteers. Please log in via the Donor Portal.');
        logout();
      }
    } else {
      setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Invalid CMS credentials. Please verify your environment or account settings.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-orange-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Brand & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform bg-white p-1">
            <img src="/seva-logo.png" alt="SEVA Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">SEVA</span>
          <span className="text-xs bg-slate-800 text-orange-400 font-semibold px-2 py-0.5 rounded border border-slate-700">CMS</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-bold mb-3 shadow-sm">
          <Sliders className="w-3.5 h-3.5" />
          <span>Operations & Platform Governance Desk</span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">
          CMS & Staff Login
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Secure authentication for the <strong>Administrator Console</strong> and <strong>Field Volunteer Operations</strong>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-800 space-y-6">
          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 flex items-start gap-2.5 text-emerald-300 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Operational Email or Registered Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter operational email or phone"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating Personnel...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Links back */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Home</span>
            </Link>
            <Link href="/login" className="hover:text-orange-400 font-semibold">
              Looking for Donor Sign In? →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CMSLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-xs font-bold text-slate-400">Loading SEVA CMS Governance Portal...</p>
      </div>
    }>
      <CMSLoginContent />
    </Suspense>
  );
}
