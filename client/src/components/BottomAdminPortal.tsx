'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, Heart, ArrowRight, Sparkles, Lock, Clock, CheckCircle2, Sliders } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BottomAdminPortalProps {
  onOpenDonate?: () => void;
  onOpenVolunteer?: () => void;
}

interface IQuotaData {
  admins: {
    current: number;
    max: number;
    isFull: boolean;
    availableSlots: number;
  };
  volunteers: {
    current: number;
    approvedCount: number;
    max: number;
    isFull: boolean;
    availableSlots: number;
  };
}

export default function BottomAdminPortal({ onOpenDonate, onOpenVolunteer }: BottomAdminPortalProps) {
  const { user } = useAuth();
  const [quotas, setQuotas] = useState<IQuotaData | null>(null);

  useEffect(() => {
    fetch('/api/auth/quotas')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.quotas) {
          setQuotas(data.quotas);
        }
      })
      .catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';
  const isVolunteer = user?.role === 'volunteer';

  const adminMax = quotas?.admins.max ?? 1;
  const adminCurrent = quotas?.admins.current ?? 1;
  const volMax = quotas?.volunteers.max ?? 4;
  const volCurrent = quotas?.volunteers.current ?? 0;

  return (
    <section id="volunteers-admins" className="py-20 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
      {/* Anchor for backward compatibility */}
      <div id="admin-portal" className="absolute -top-10" />

      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-orange-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-bold tracking-wide shadow-sm">
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>OPERATIONS & GOVERNANCE • CMS & ENV MANAGED</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Volunteers & Administrators Hub
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            Authorized personnel managing ground humanitarian dispatches and platform governance. Strictly governed by role capacity quotas (<span className="text-orange-400 font-bold">{adminMax} Admin</span> and <span className="text-emerald-400 font-bold">{volMax} Volunteers</span>) configured via CMS and environment.
          </p>
        </div>

        {/* 2-Column Operations Hub */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Volunteer Operations */}
          <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-6 group shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                  volCurrent >= volMax
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  QUOTA: {volCurrent}/{volMax} ACTIVE SLOTS
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                  Field Volunteer Operations
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Participate in food rescue pickups, emergency slum food dispatches, photographic distribution logging, and field hand cash collection with verified Digital ID badges.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Digital Volunteer ID Badge with live QR verification</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>On-ground manual hand cash donation receipts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Field drive meal recording with photo evidence</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
              {isVolunteer ? (
                <Link
                  href="/volunteer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
                >
                  <span>Open Volunteer Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login?redirect=/volunteer&role=volunteer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
                  >
                    <span>Volunteer Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {onOpenVolunteer && volCurrent < volMax && (
                    <button
                      onClick={onOpenVolunteer}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-all"
                    >
                      Apply for Slot
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Card 2: Admin Governance */}
          <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800/90 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-6 group shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                  adminCurrent >= adminMax
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  QUOTA: {adminCurrent}/{adminMax} ADMIN ACTIVE
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                  Administrator Governance Console
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Master CMS and compliance control over all 16 platform modules: Campaign lifecycles, UPI QR anti-fraud verification, volunteer applications, financial transparency ledgers, and audit logs.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>16-tab unified CMS control panel & visual visualizers</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Payment QR review gate before public display</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Immutable historical audit trail with full diff logging</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
              <Link
                href={isAdmin ? '/admin' : '/login?redirect=/admin&role=admin'}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Open Admin Console' : 'Administrator Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Separate Donor Section Callout */}
        <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/40 border border-orange-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wide">
              <Heart className="w-4 h-4 fill-orange-400" />
              <span>Public Donor Community (Separate & Unlimited)</span>
            </div>
            <p className="text-xs text-slate-300">
              Looking to contribute or support a family? Contributions are open to all donors with zero quota limits. All gifts starting from ₹20 are eligible for 80G tax deductions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenDonate ? (
              <button
                onClick={onOpenDonate}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-900/30"
              >
                <span>Make a Contribution</span>
              </button>
            ) : (
              <Link
                href="#campaigns"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-900/30"
              >
                <span>View Campaigns</span>
              </Link>
            )}

            <Link
              href="/donor"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors"
            >
              <span>Donor Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
