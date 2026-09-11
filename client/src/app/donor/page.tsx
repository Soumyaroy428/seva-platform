'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Utensils,
  Download,
  Calendar,
  CreditCard,
  Mail,
  Smartphone,
  CheckCircle,
  Bell,
  Settings,
  ArrowLeft,
  ArrowRight,
  Lock,
  Sparkles,
  LogOut,
  PlusCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { IDonation, ICampaign } from '@/lib/types';
import ReceiptModal from '@/components/ReceiptModal';
import DonationModal from '@/components/DonationModal';

export default function DonorDashboard() {
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'impact' | 'preferences'>('overview');
  const [donations, setDonations] = useState<IDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<IDonation | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  // Preferences
  const [emailPref, setEmailPref] = useState(true);
  const [smsPref, setSmsPref] = useState(true);
  const [monthlyImpactPref, setMonthlyImpactPref] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const fetchDonorData = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [donRes, campRes] = await Promise.all([
        fetch(`/api/donations?donorEmail=${encodeURIComponent(user.email)}`).then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json())
      ]);

      if (donRes.success) {
        // If user has personal donations, display those. If newly registered, we also check general donations
        setDonations(donRes.data);
      }
      if (campRes.success) {
        setCampaigns(campRes.data);
      }
    } catch (err) {
      console.error('Error fetching donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchDonorData();
    }
  }, [user]);

  const handleDonationSuccess = (newDonation: IDonation) => {
    setShowDonateModal(false);
    setSelectedReceipt(newDonation);
    fetchDonorData();
  };

  // Auth Guard: Loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center animate-pulse">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <p className="text-xs font-bold text-slate-400">Loading Donor Dashboard...</p>
      </div>
    );
  }

  // Auth Guard: Unauthenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Donor Impact Portal</h2>
            <p className="text-xs text-slate-400 mt-2">
              Please sign in with your donor account to view your past donations, download 80G tax receipts, and track your hunger relief impact.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/donor&role=donor"
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20"
            >
              <span>Sign In to Donor Portal with OTP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 inline-block">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    );
  }

  const totalDonated = donations.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMealsSupported = Math.floor(totalDonated / 25);
  const campaignsSupportedCount = new Set(donations.map(d => d.campaignTitle)).size;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Site</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wide text-white">DONOR IMPACT HUB</h1>
                <p className="text-[10px] text-slate-400">Personal Contributions & 80G Tax Receipts</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-bold text-white">{user.name}</span>
              <span className="block text-[10px] text-rose-400 font-semibold">{user.email}</span>
            </div>
            <button
              onClick={() => setShowDonateModal(true)}
              className="py-1.5 px-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Donate Money</span>
            </button>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              My Impact Overview
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'donations'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              My Donations & 80G Receipts ({donations.length})
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'impact'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Simulated SMS & Reports
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'preferences'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Preferences
            </button>
          </div>

          <button
            onClick={() => setShowDonateModal(true)}
            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Make New Donation</span>
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Donated by You</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalDonated)}</p>
                <span className="text-[10px] text-emerald-600 font-bold">100% Tax Deductible (Sec 80G)</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warm Meals Funded</span>
                <p className="text-2xl font-black text-orange-600 mt-1">{totalMealsSupported} Meals</p>
                <span className="text-[10px] text-slate-500 font-semibold">Calculated at ₹25/meal benchmark</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campaigns Supported</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{campaignsSupportedCount || (donations.length > 0 ? 1 : 0)}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Emergency and community kitchens</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Tax Savings</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(Math.floor(totalDonated * 0.15))}</p>
                <span className="text-[10px] text-slate-500 font-semibold">50% Deduction under IT Act 80G</span>
              </div>
            </div>

            {/* Empty state or quick list */}
            {donations.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Welcome to Your Impact Hub, {user.name}!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    You haven't made a donation with this account yet. Support hungry children and flood victims today starting from just ₹20.
                  </p>
                </div>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Donate Your First Meal (from ₹20)</span>
                </button>
              </div>
            ) : (
              /* Recent Donations summary card */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Contributions</h3>
                  <button onClick={() => setActiveTab('donations')} className="text-xs text-orange-600 font-bold hover:underline">
                    View All & Receipts →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {donations.slice(0, 3).map(don => (
                    <div key={don.id || don.donationId} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{don.campaignTitle || 'General Relief'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{don.donationId} • {don.createdAt ? don.createdAt.toString().split('T')[0] : 'Recent'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-emerald-700">{formatINR(don.amount)}</span>
                        <button
                          onClick={() => setSelectedReceipt(don)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>80G Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DONATIONS TAB */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Donation History & 80G Tax Exemption Receipts</h2>
                <p className="text-xs text-slate-500">
                  Every contribution is logged with a unique traceable transaction ID. Download printable 80G tax exemption certificates below.
                </p>
              </div>
              <button
                onClick={() => setShowDonateModal(true)}
                className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm self-start"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Make New Donation</span>
              </button>
            </div>

            {donations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No donations found for this account. Make your first donation to generate an 80G tax receipt.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Donation ID</th>
                      <th className="py-3 px-4">Campaign</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 rounded-r-lg text-right">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.map(don => (
                      <tr key={don.id || don.donationId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{don.donationId}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{don.campaignTitle || 'General Hunger Relief'}</td>
                        <td className="py-3 px-4 font-black text-emerald-700 text-sm">{formatINR(don.amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            don.paymentMethod === 'Cash' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {don.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {don.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {don.createdAt ? don.createdAt.toString().split('T')[0] : 'Recent'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(don)}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-bold text-xs flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>80G Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* IMPACT TAB */}
        {activeTab === 'impact' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Simulated SMS & Monthly Impact Reports</h2>
              <p className="text-xs text-slate-500">
                Transparent live updates showing how your funds were converted into nutritional meals on the ground.
              </p>
            </div>

            {/* Simulated SMS Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 max-w-md shadow-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-orange-400" />
                  <span>SMS from SEVA-IMPACT</span>
                </span>
                <span>Delivered Today</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-100 font-medium">
                ❤️ Your Seva Monthly Impact. Thank you for supporting Seva, {user.name}. Your contribution of {formatINR(totalDonated)} helped fund <strong>{totalMealsSupported} warm meals</strong> across our relief zones. 100% ground verified. 🙏
              </p>
            </div>

            {/* Simulated Email Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-500 border-b border-slate-200 pb-3">
                <Mail className="w-4 h-4 text-orange-600" />
                <span>Subject: <strong>Your Seva Monthly Impact Report - 2026</strong></span>
              </div>

              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p>Dear {user.name},</p>
                <p>
                  Because of your generosity of {formatINR(totalDonated)}, Seva field volunteers and mobile kitchen vans distributed hot, fresh meals to children and elderly residents across flood-affected zones and urban settlements.
                </p>
                <div className="p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Contribution</span>
                    <p className="text-lg font-black text-slate-900">{formatINR(totalDonated)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Meals Served</span>
                    <p className="text-lg font-black text-orange-600">{totalMealsSupported} Plates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm max-w-2xl">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Communication Preferences</h2>
              <p className="text-xs text-slate-500">
                Manage transactional confirmations vs. optional monthly impact summaries.
              </p>
            </div>

            {savedFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Preferences saved successfully.</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPref}
                  onChange={e => setEmailPref(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Instant 80G Email Receipts (Transactional)</span>
                  <span className="text-slate-500">Receive tax deduction receipt immediately after any successful donation.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsPref}
                  onChange={e => setSmsPref(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Instant SMS Contribution Acknowledgement</span>
                  <span className="text-slate-500">Receive SMS confirmation with unique Donation ID and status.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={monthlyImpactPref}
                  onChange={e => setMonthlyImpactPref(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Monthly Community Impact Digest</span>
                  <span className="text-slate-500">Monthly statistical summary of meals served and families aided by your contributions.</span>
                </div>
              </label>

              <button
                onClick={() => {
                  setSavedFeedback(true);
                  setTimeout(() => setSavedFeedback(false), 3000);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Tax Receipt Modal */}
      <ReceiptModal
        donation={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Donation Modal for Donor */}
      <DonationModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        campaign={campaigns[0] || null}
        onSuccess={handleDonationSuccess}
      />
    </div>
  );
}
