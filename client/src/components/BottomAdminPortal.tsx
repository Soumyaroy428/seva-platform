'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BottomAdminPortal() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const targetHref = isAdmin ? '/admin' : '/login?redirect=/admin&role=admin';



  return (
    <section id="admin-portal" className="py-20 bg-[#f8fafc] border-t border-slate-200/60 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center flex flex-col items-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0b0f19] text-white text-xs font-semibold shadow-sm mb-6">
          <Shield className="w-3.5 h-3.5 text-orange-400" />
          <span>Admin Portal</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
          Are you the admin?
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
          Manage campaigns, donations, volunteers, bank accounts and site settings from the admin dashboard.
        </p>

        {/* CTA Button */}
        <Link
          href={targetHref}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0b0f19] hover:bg-[#1e293b] text-white text-sm font-semibold shadow-md transition-all group"
        >
          <span>Admin Login</span>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
