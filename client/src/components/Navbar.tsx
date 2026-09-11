'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X, ShieldCheck, UserCheck, Utensils, Award, HelpCircle, ChevronDown, User, LogOut, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenDonate?: () => void;
  onOpenFoodDonate?: () => void;
  onOpenVolunteer?: () => void;
}

export default function Navbar({ onOpenDonate, onOpenFoodDonate, onOpenVolunteer }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => { if (d.success) setSiteSettings(d.data); })
      .catch(() => {});
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'volunteer') return '/volunteer';
    return '/donor';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm transition-all">
      {/* Top emergency / trust announcement strip */}
      {siteSettings?.emergencyBannerEnabled !== false && (
        <div className={`text-white text-xs py-1.5 px-4 font-medium transition-all ${
          siteSettings?.bannerTheme === 'red'
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
            : siteSettings?.bannerTheme === 'emerald'
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
            : siteSettings?.bannerTheme === 'slate'
            ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950'
            : siteSettings?.bannerTheme === 'amber'
            ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700'
            : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                {siteSettings?.emergencyBannerBadge || 'Active Relief'}
              </span>
              <span>{siteSettings?.emergencyBannerText || 'Emergency Flood & Slum Relief Kitchens Active across 12 zones'}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hidden sm:inline">
                {siteSettings?.trustTagline || `100% Verified Transparency • Min Donation ₹${siteSettings?.minDonationINR || 20}`}
              </span>
              <span className="text-orange-200">
                Helpline: {siteSettings?.helplinePhone || '+91 1800-SEVA-AID'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
              <img
                src="/seva-logo.png"
                alt="SEVA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">SEVA</span>
                <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-1.5 py-0.5 rounded">सेवा</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">Traceable Community Food & Relief</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <Link href="#campaigns" className="hover:text-orange-600 transition-colors">Campaigns</Link>
            <Link href="#how-it-works" className="hover:text-orange-600 transition-colors">How It Works</Link>
            <Link href="#food-rescue" className="hover:text-orange-600 transition-colors">Food Donation</Link>
            <Link href="#transparency" className="hover:text-orange-600 transition-colors">Transparency</Link>
            <Link href="#committee" className="hover:text-orange-600 transition-colors">Committee</Link>
            <Link href="#stories" className="hover:text-orange-600 transition-colors">Stories</Link>
            <Link href="#faq" className="hover:text-orange-600 transition-colors">FAQ</Link>

            {/* Role Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center gap-1 hover:text-orange-600 font-semibold px-2 py-1 rounded-md"
              >
                <span>Portals</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <Link
                    href="/admin"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    Admin Control Center
                  </Link>
                  <Link
                    href="/donor"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Donor Impact Portal
                  </Link>
                  <Link
                    href="/volunteer"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Volunteer Operations
                  </Link>
                  <Link
                    href="/beneficiary"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <Utensils className="w-4 h-4 text-indigo-600" />
                    Beneficiary Digital Pass
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {onOpenVolunteer && !user && (
              <button
                onClick={onOpenVolunteer}
                className="text-xs font-bold text-slate-700 hover:text-orange-600 px-3 py-2 rounded-lg border border-slate-200 hover:border-orange-300 transition-all"
              >
                Become Volunteer
              </button>
            )}
            {onOpenFoodDonate && (
              <button
                onClick={onOpenFoodDonate}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg border border-emerald-200 transition-all flex items-center gap-1.5"
              >
                <Utensils className="w-3.5 h-3.5" />
                Donate Food
              </button>
            )}

            <button
              onClick={onOpenDonate}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Donate Now</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">≥ ₹{siteSettings?.minDonationINR || 20}</span>
            </button>

            {/* Authentication state in Navbar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">{user.name}</div>
                    <div className="text-[10px] font-semibold flex items-center gap-1">
                      {user.role === 'admin' && <span className="text-orange-600 font-bold">Admin</span>}
                      {user.role === 'donor' && <span className="text-rose-600 font-bold">Donor</span>}
                      {user.role === 'volunteer' && (
                        <span className={user.volunteerStatus === 'Approved' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          Vol. {user.volunteerStatus === 'Approved' ? '✓' : '(Pending)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          Role: {user.role} {user.role === 'volunteer' ? `(${user.volunteerStatus || 'Pending'})` : ''}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span>My {user.role === 'admin' ? 'Admin Center' : user.role === 'volunteer' ? 'Volunteer Hub' : 'Donor Portal'}</span>
                    </Link>

                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl border border-slate-200 hover:border-orange-300 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-600" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={onOpenDonate}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-600 flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Donate</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {user ? (
            <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.email} • {user.role}</p>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-700">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">Home</Link>
            <Link href="#campaigns" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">Campaigns</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">How It Works</Link>
            <Link href="#food-rescue" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">Food Donation</Link>
            <Link href="#transparency" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">Transparency</Link>
            <Link href="#committee" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">Committee</Link>
            <Link href="#stories" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">Stories</Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded hover:bg-orange-50">FAQ</Link>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Role Dashboards</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded text-xs font-bold text-orange-700 bg-orange-50 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Admin Portal
              </Link>
              <Link href="/donor" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded text-xs font-bold text-rose-700 bg-rose-50 flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> Donor Portal
              </Link>
              <Link href="/volunteer" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded text-xs font-bold text-emerald-700 bg-emerald-50 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Volunteer Hub
              </Link>
              <Link href="/beneficiary" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded text-xs font-bold text-indigo-700 bg-indigo-50 flex items-center gap-1.5">
                <Utensils className="w-4 h-4" /> Beneficiary Pass
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
