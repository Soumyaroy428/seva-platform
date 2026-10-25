'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  KeyRound,
  Check
} from 'lucide-react';

function CMSLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get('role'); // 'admin' | 'volunteer' | null
  const redirectUrl = searchParams.get('redirect');

  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Default credentials configured via Environment (.env / .env.local)
  const envAdminEmail = process.env.NEXT_PUBLIC_CMS_ADMIN_EMAIL || 'admin@seva.org';
  const envAdminPass = process.env.NEXT_PUBLIC_CMS_ADMIN_PASSWORD || 'Admin@123456';

  const envVolunteers = [
    {
      slot: 1,
      name: 'Field Volunteer Slot 1',
      zone: 'North Relief Slums',
      email: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_1_EMAIL || 'volunteer1@seva.org',
      password: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_1_PASSWORD || 'Vol@2026_Slot1'
    },
    {
      slot: 2,
      name: 'Field Volunteer Slot 2',
      zone: 'South Kitchen Zone',
      email: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_2_EMAIL || 'volunteer2@seva.org',
      password: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_2_PASSWORD || 'Vol@2026_Slot2'
    },
    {
      slot: 3,
      name: 'Field Volunteer Slot 3',
      zone: 'East Mobile Relief Cart',
      email: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_3_EMAIL || 'volunteer3@seva.org',
      password: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_3_PASSWORD || 'Vol@2026_Slot3'
    },
    {
      slot: 4,
      name: 'Field Volunteer Slot 4',
      zone: 'West Community Kitchen',
      email: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_4_EMAIL || 'volunteer4@seva.org',
      password: process.env.NEXT_PUBLIC_CMS_VOLUNTEER_4_PASSWORD || 'Vol@2026_Slot4'
    }
  ];

  // Pre-fill according to requested role query parameter if provided
  useEffect(() => {
    if (requestedRole === 'admin') {
      setIdentifier(envAdminEmail);
      setPassword(envAdminPass);
    } else if (requestedRole === 'volunteer') {
      setIdentifier(envVolunteers[0].email);
      setPassword(envVolunteers[0].password);
    }
  }, [requestedRole, envAdminEmail, envAdminPass]);

  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setIdentifier(targetEmail);
    setPassword(targetPass);
    setError('');
    setSuccessMessage(`Loaded credentials for ${targetEmail}`);
  };

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
        // Logged in as donor through CMS
        setError('This portal is restricted to Administrators and Field Volunteers. Please log in via the Donor Portal.');
      }
    } else {
      setError(typeof res.error === 'string' ? res.error : (res.error as any)?.message || 'Invalid CMS credentials. Check your environment settings.');
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
          Secure authentication for the <strong>Administrator Console</strong> and the <strong>4 Field Volunteer Slots</strong> configured via Environment.
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
                  placeholder="admin@seva.org or volunteer1@seva.org"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password (Configured in .env)
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
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating Personnel...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Fill Environment Credential Helper Card */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Env-Configured Personnel Accounts
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1 Admin • 4 Volunteers</span>
            </div>

            <div className="space-y-2">
              {/* Administrator Slot */}
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/50 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-bold text-purple-200 truncate">Chief Administrator</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{envAdminEmail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickFill(envAdminEmail, envAdminPass)}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shrink-0 transition-colors"
                >
                  Quick Fill
                </button>
              </div>

              {/* 4 Field Volunteer Slots */}
              {envVolunteers.map(vol => (
                <div key={vol.slot} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-200 truncate">{vol.name}</span>
                      <span className="text-[9px] text-slate-500 truncate">({vol.zone})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{vol.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickFill(vol.email, vol.password)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold shrink-0 transition-colors"
                  >
                    Slot {vol.slot}
                  </button>
                </div>
              ))}
            </div>
          </div>

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
