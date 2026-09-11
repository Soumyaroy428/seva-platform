'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Phone, Mail, MapPin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-900 border border-slate-800">
                <img src="/seva-logo.png" alt="SEVA Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">SEVA</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              “Your Contribution. Someone's Meal. Someone's Hope.”
              A transparent, full-phase digital social operating system connecting donors, volunteers, and people in need with verifiable ground truth.
            </p>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tax Exemption Registration:</span>
              </p>
              <p>Registered Public Charitable Trust. Valid 80G digital certificates issued for all contributions ≥ ₹20.</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Public Hub</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#campaigns" className="hover:text-orange-400 transition-colors">Active Campaigns</Link></li>
              <li><Link href="#how-it-works" className="hover:text-orange-400 transition-colors">How Seva Works</Link></li>
              <li><Link href="#food-rescue" className="hover:text-orange-400 transition-colors">Surplus Food Rescue</Link></li>
              <li><Link href="#transparency" className="hover:text-orange-400 transition-colors">Transparency Center</Link></li>
              <li><Link href="#distributions" className="hover:text-orange-400 transition-colors">Field Distributions</Link></li>
              <li><Link href="#committee" className="hover:text-orange-400 transition-colors">Managing Committee</Link></li>
            </ul>
          </div>

          {/* Col 3: Operational Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Role Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/admin" className="hover:text-orange-400 transition-colors">Admin Control Center</Link></li>
              <li><Link href="/donor" className="hover:text-orange-400 transition-colors">Donor Dashboard</Link></li>
              <li><Link href="/volunteer" className="hover:text-orange-400 transition-colors">Volunteer Hub</Link></li>
              <li><Link href="/beneficiary" className="hover:text-orange-400 transition-colors">Beneficiary Pass</Link></li>
              <li><Link href="#faq" className="hover:text-orange-400 transition-colors">Rules & FAQ</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Direct Helpline</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>+91 1800-SEVA-AID</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>support@seva.org</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>Central Relief Office, Salt Lake Sector 5, India</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 text-xs transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Seva Social Welfare Trust. All rights reserved. Minimum Donation: ₹20 INR.</p>
          <div className="flex items-center gap-6">
            <Link href="#faq" className="hover:underline">Privacy Policy</Link>
            <Link href="#faq" className="hover:underline">Terms of Service</Link>
            <Link href="#transparency" className="hover:underline">Audit Statements</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
