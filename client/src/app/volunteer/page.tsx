'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  UserCheck,
  Calendar,
  Utensils,
  Award,
  Clock,
  Camera,
  CheckCircle,
  PlusCircle,
  MapPin,
  ArrowLeft,
  ArrowRight,
  QrCode,
  ShieldCheck,
  DollarSign,
  Search,
  Filter,
  Check,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  Phone,
  Mail,
  FileText,
  CreditCard
} from 'lucide-react';
import { IVolunteer, IDistributionEvent, IDonation, ICampaign } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import DigitalVolunteerID from '@/components/DigitalVolunteerID';

export default function VolunteerDashboard() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'payments' | 'hand-cash' | 'distribution' | 'badge'>('payments');
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<IVolunteer[]>([]);
  const [distributions, setDistributions] = useState<IDistributionEvent[]>([]);
  const [donations, setDonations] = useState<IDonation[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [feedback, setFeedback] = useState('');
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  // Search & Filter in Donations History
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'Cash' | 'UPI' | 'Card'>('ALL');

  // Manual Hand Cash Form state
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashDonorName, setCashDonorName] = useState('');
  const [cashDonorPhone, setCashDonorPhone] = useState('');
  const [cashDonorEmail, setCashDonorEmail] = useState('');
  const [cashAmount, setCashAmount] = useState<number>(250);
  const [cashCampaignTitle, setCashCampaignTitle] = useState('Emergency Flood Relief Kitchen 2026');
  const [cashReceiptNote, setCashReceiptNote] = useState('Collected in hand during evening slum food dispatch');
  const [cashDate, setCashDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingCash, setSubmittingCash] = useState(false);

  // Donation Status Update Modal state
  const [selectedDonation, setSelectedDonation] = useState<IDonation | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('Verified');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Distribution form states
  const [showDistModal, setShowDistModal] = useState(false);
  const [distCamp, setDistCamp] = useState('Emergency Flood Relief Kitchen 2026');
  const [distLoc, setDistLoc] = useState('Sector 4 Community Shed');
  const [distMeals, setDistMeals] = useState(250);
  const [distNotes, setDistNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [volsRes, distsRes, donsRes, campsRes] = await Promise.all([
        fetch('/api/volunteers').then(r => r.json()),
        fetch('/api/distributions').then(r => r.json()),
        fetch('/api/donations').then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json())
      ]);

      if (volsRes.success) setVolunteers(volsRes.data);
      if (distsRes.success) setDistributions(distsRes.data);
      if (donsRes.success) setDonations(donsRes.data);
      if (campsRes.success) setCampaigns(campsRes.data);
    } catch (e) {
      console.error('Error fetching volunteer portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefreshApproval = async () => {
    setRefreshingStatus(true);
    await refreshUser();
    await fetchData();
    setRefreshingStatus(false);
  };

  // Submit manual hand cash donation
  const handleRecordHandCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cashAmount < 20) {
      alert('Minimum donation amount is ₹20.');
      return;
    }

    setSubmittingCash(true);
    try {
      const res = await fetch('/api/donations/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: cashDonorName,
          donorPhone: cashDonorPhone,
          donorEmail: cashDonorEmail,
          amount: cashAmount,
          campaignTitle: cashCampaignTitle,
          receiptNote: cashReceiptNote,
          collectedBy: user?.name || 'Volunteer Team',
          date: cashDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Manual hand cash of ₹${cashAmount} recorded successfully! Receipt ID: ${data.data.donationId}`);
        setShowCashModal(false);
        // Reset form
        setCashDonorName('');
        setCashDonorPhone('');
        setCashDonorEmail('');
        setCashAmount(250);
        fetchData();
        setTimeout(() => setFeedback(''), 4000);
      } else {
        alert(data.error || 'Failed to record cash');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingCash(false);
    }
  };

  // Update existing donation status
  const handleUpdateDonationStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;

    setSubmittingUpdate(true);
    try {
      const res = await fetch(`/api/donations/${selectedDonation.id || selectedDonation.donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          notes: updateNotes,
          reviewer: user?.name || 'Field Volunteer'
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Donation record ${selectedDonation.donationId} updated to ${updateStatus}.`);
        setSelectedDonation(null);
        fetchData();
        setTimeout(() => setFeedback(''), 3000);
      } else {
        alert(data.error || 'Failed to update donation');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  // Record meal distribution
  const handleRecordDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/distributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: distCamp,
          location: distLoc,
          mealsDistributed: Number(distMeals),
          beneficiariesCount: Math.floor(Number(distMeals) / 3),
          volunteersAssigned: [user?.name || 'Sneha Banerjee'],
          notes: distNotes,
          proofPhotos: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop']
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowDistModal(false);
        setFeedback('Distribution mission logged and verified successfully!');
        fetchData();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth Guard: Loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center animate-pulse">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-bold text-slate-400">Loading Volunteer Portal...</p>
      </div>
    );
  }

  // Auth Guard: Unauthenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Volunteer Operations Login</h2>
            <p className="text-xs text-slate-400 mt-2">
              Please sign in with your volunteer credentials to access payment history, manual hand cash collection, and relief distribution logs.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/volunteer&role=volunteer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <span>Sign In to Volunteer Hub with OTP</span>
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

  // Auth Guard: Wrong Role (e.g. Donor accessing Volunteer portal)
  if (user.role !== 'volunteer' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Volunteer Access Required</h2>
            <p className="text-xs text-slate-400 mt-2">
              You are logged in as a <strong className="text-rose-400 uppercase">{user.role}</strong> ({user.name}). This section is reserved for verified field volunteers.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/donor"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              Go to Your Donor Dashboard
            </Link>
            <button
              onClick={() => logout()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Sign Out & Switch to Volunteer Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VOLUNTEER APPROVAL GATE:
  // If user is a volunteer and NOT APPROVED yet by the Admin!
  // -------------------------------------------------------------
  const isApproved = user.role === 'admin' || user.volunteerStatus === 'Approved';

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Return Home</span>
              </Link>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white">VOLUNTEER OPERATIONS</h1>
                  <p className="text-[10px] text-slate-400">Account Status Review</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">{user.name}</span>
              <button
                onClick={() => logout()}
                className="text-xs font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Pending Approval Screen */}
        <main className="max-w-3xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
            {/* Amber Top Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Volunteer Application Under Review</h2>
                  <p className="text-xs text-amber-100 mt-0.5">Admin approval required before accessing field operations</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 bg-black/20 backdrop-blur rounded-full text-xs font-black uppercase tracking-wider">
                Status: {user.volunteerStatus || 'Pending'}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-sm text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Trust & Security Verification Notice
                </p>
                <p className="leading-relaxed">
                  Welcome, <strong>{user.name}</strong>! To ensure donor trust, anti-fraud compliance, and child & beneficiary safety, all field volunteers must be reviewed and officially verified by the Managing Trustee.
                </p>
                <p className="leading-relaxed text-slate-700">
                  Once an administrator approves your profile in the <strong>Admin Control Center</strong>, your operational permissions (hand cash collection, payment histories, and distribution vouchers) will instantly unlock.
                </p>
              </div>

              {/* Registered Volunteer Details Card */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Submitted Credentials</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Volunteer ID</span>
                    <span className="font-mono font-bold text-orange-600 text-sm">{user.volunteerId || 'Pending Assignment'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Primary Contact</span>
                    <span className="font-semibold text-slate-800">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Area</span>
                    <span className="font-semibold text-slate-800">{user.area || 'General Outreach Zone'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Availability</span>
                    <span className="font-semibold text-slate-800">{user.availability || 'Weekends'}</span>
                  </div>
                </div>

                {user.skills && user.skills.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] mb-1">Declared Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((sk: string) => (
                        <span key={sk} className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleRefreshApproval}
                  disabled={refreshingStatus}
                  className="w-full sm:w-auto flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingStatus ? 'animate-spin' : ''}`} />
                  <span>{refreshingStatus ? 'Checking Status...' : 'Refresh Approval Status'}</span>
                </button>

                <Link
                  href="/"
                  className="w-full sm:w-auto py-3 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs text-center transition-colors"
                >
                  Return to Home
                </Link>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <strong className="text-slate-700">Approval Workflow:</strong> Open the <Link href="/admin" className="text-orange-600 font-bold underline">Admin Portal</Link> (or sign in as Admin via OTP), go to <strong>Volunteer Control</strong>, click <strong>"Approve"</strong> next to this volunteer, and then click <em>Refresh Approval Status</em> above to experience instant live unlocking!
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-xs text-slate-400">
          Seva Volunteer Welfare Helpline: +91 1800-SEVA-AID • All Field Operations Audited
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // APPROVED VOLUNTEER OPERATIONAL HUB
  // -------------------------------------------------------------
  const currentVolunteer: IVolunteer = {
    id: user.id || 'vol-active',
    volunteerId: user.volunteerId || 'SEVA-VOL-1088',
    name: user.name,
    email: user.email,
    phone: user.phone || '+91 98302 11943',
    area: user.area || 'East Bypass & Suburbs',
    skills: user.skills || ['Nutritionist', 'Packaging', 'Beneficiary Verification'],
    availability: (user.availability as any) || 'Full-Time',
    status: 'Approved',
    hoursLogged: 78,
    tasksCompleted: 31,
    joinedDate: '2026-03-01'
  };

  const filteredDonations = donations.filter(don => {
    if (methodFilter === 'Cash') return don.paymentMethod === 'Cash';
    if (methodFilter === 'UPI') return don.paymentMethod === 'UPI' || don.paymentMethod === 'QR';
    if (methodFilter === 'Card') return don.paymentMethod === 'Card';
    return true;
  }).filter(don => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      don.donorName.toLowerCase().includes(q) ||
      don.donationId.toLowerCase().includes(q) ||
      (don.campaignTitle && don.campaignTitle.toLowerCase().includes(q))
    );
  });

  const totalHandCashAmount = donations
    .filter(d => d.paymentMethod === 'Cash')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Site</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white">VOLUNTEER OPERATIONS HUB</h1>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  Verified & Approved Field Force • {currentVolunteer.volunteerId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-bold text-white">{user.name}</span>
              <span className="block text-[10px] text-emerald-400 font-bold">Approved Field Member</span>
            </div>
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

      {/* Main Operations Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>All Payment & Donation History</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">{donations.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('hand-cash')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'hand-cash'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>Manual Hand Cash Updates</span>
            </button>

            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'distribution'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Food Distributions</span>
            </button>

            <button
              onClick={() => setActiveTab('badge')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'badge'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>My Digital Volunteer ID</span>
            </button>
          </div>

          {/* Top Hand Cash CTA */}
          <button
            onClick={() => setShowCashModal(true)}
            className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Field Hand Cash</span>
          </button>
        </div>

        {/* TAB 1: ALL PAYMENT & DONATION HISTORY */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Platform Payment & Donation History</h2>
                <p className="text-xs text-slate-500">
                  Review all online contributions and ground hand cash payments. You can update transaction verification status and field notes.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
                  {(['ALL', 'Cash', 'UPI', 'Card'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setMethodFilter(method)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        methodFilter === method ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-600'
                      }`}
                    >
                      {method === 'ALL' ? 'All Methods' : method === 'Cash' ? 'Hand Cash' : method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search row */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search donor name, receipt ID, or campaign..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Showing <strong>{filteredDonations.length}</strong> donation entries
              </div>
            </div>

            {/* Donations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Donation ID</th>
                    <th className="py-3 px-4">Donor Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Method & Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                        No donation records found.
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map(don => (
                      <tr key={don.id || don.donationId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{don.donationId}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{don.donorName}</p>
                          <p className="text-[11px] text-slate-500">{don.donorEmail}</p>
                          {don.donorPhone && <p className="text-[11px] text-slate-400">{don.donorPhone}</p>}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                          {formatINR(don.amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{don.campaignTitle || 'General Relief'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            don.paymentMethod === 'Cash' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800'
                          }`}>
                            {don.paymentMethod}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {don.createdAt ? don.createdAt.toString().split('T')[0] : 'Recent'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            don.status === 'Verified' || don.status === 'Successful'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {don.status}
                          </span>
                          {don.collectedBy && (
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              By: {don.collectedBy}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedDonation(don);
                              setUpdateStatus(don.status || 'Verified');
                              setUpdateNotes(don.receiptNote || '');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL HAND CASH UPDATES */}
        {activeTab === 'hand-cash' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Manual Hand Cash Collections</h2>
                <p className="text-xs text-slate-500">
                  Volunteers collecting physical cash in relief camps, temples, or street drives must immediately log collections here to ensure 100% transparency.
                </p>
              </div>

              <button
                onClick={() => setShowCashModal(true)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all self-start"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Collect Offline Hand Cash</span>
              </button>
            </div>

            {/* Hand Cash Overview Stat */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Total Field Cash Logged</span>
                <p className="text-2xl font-black text-amber-900 mt-1">{formatINR(totalHandCashAmount)}</p>
                <span className="text-[10px] text-amber-700 font-semibold">100% traceably credited to campaigns</span>
              </div>

              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Cash Receipts Issued</span>
                <p className="text-2xl font-black text-emerald-900 mt-1">
                  {donations.filter(d => d.paymentMethod === 'Cash').length}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold">Audited on platform ledger</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Logged By Your ID</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currentVolunteer.volunteerId}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Identity stamped on every entry</span>
              </div>
            </div>

            {/* Hand Cash Donations Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recorded Hand Cash Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Voucher / ID</th>
                      <th className="py-2.5 px-3">Donor Name</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Allocated Campaign</th>
                      <th className="py-2.5 px-3">Date Collected</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Collector Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.filter(d => d.paymentMethod === 'Cash').length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-slate-400 font-semibold">
                          No manual hand cash recorded yet. Click above to log your first field collection.
                        </td>
                      </tr>
                    ) : (
                      donations.filter(d => d.paymentMethod === 'Cash').map(don => (
                        <tr key={don.id || don.donationId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-800">{don.donationId}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{don.donorName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{don.donorPhone || don.donorEmail}</td>
                          <td className="py-2.5 px-3 font-black text-emerald-700">{formatINR(don.amount)}</td>
                          <td className="py-2.5 px-3 text-slate-700">{don.campaignTitle}</td>
                          <td className="py-2.5 px-3 text-slate-500">{don.createdAt ? don.createdAt.toString().split('T')[0] : 'Today'}</td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium">{don.receiptNote || 'Verified hand cash receipt'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOOD DISTRIBUTIONS */}
        {activeTab === 'distribution' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Food Distribution Missions</h2>
                <p className="text-xs text-slate-500">Record hot meal distributions, food packets, and ration delivery missions.</p>
              </div>
              <button
                onClick={() => setShowDistModal(true)}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Distribution Event</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {distributions.map(d => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                    <span>{d.eventId}</span>
                    <span>{d.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{d.campaignTitle}</h4>
                  <p className="text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{d.location}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 font-bold">
                    <div className="text-orange-700">{d.mealsDistributed} Meals Given</div>
                    <div className="text-indigo-700 text-right">{d.beneficiariesCount} Families</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DIGITAL VOLUNTEER ID */}
        {activeTab === 'badge' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-500">
              Present this Digital ID at police checkpoints, flood shelters, and relief distribution zones.
            </p>
            <DigitalVolunteerID volunteer={currentVolunteer} />
          </div>
        )}
      </main>

      {/* MODAL: MANUAL HAND CASH COLLECTION */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Record Manual Hand Cash Collection</h3>
                <p className="text-[11px] text-slate-500">Credited to campaign with traceable receipt number</p>
              </div>
              <button onClick={() => setShowCashModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRecordHandCash} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={cashDonorName}
                    onChange={e => setCashDonorName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Donor Phone *</label>
                  <input
                    type="tel"
                    required
                    value={cashDonorPhone}
                    onChange={e => setCashDonorPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Amount in Cash (₹) *</label>
                  <input
                    type="number"
                    min="20"
                    required
                    value={cashAmount}
                    onChange={e => setCashAmount(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Min. ₹20 policy enforced</span>
                </div>
                <div>
                  <label className="font-bold block mb-1">Date Collected</label>
                  <input
                    type="date"
                    required
                    value={cashDate}
                    onChange={e => setCashDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Donor Email (For 80G Receipt)</label>
                <input
                  type="email"
                  value={cashDonorEmail}
                  onChange={e => setCashDonorEmail(e.target.value)}
                  placeholder="donor@example.com (optional)"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Select Relief Campaign</label>
                <select
                  value={cashCampaignTitle}
                  onChange={e => setCashCampaignTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-semibold text-slate-800"
                >
                  {campaigns.map(c => (
                    <option key={c.id || c.title} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Volunteer Collection Note / Voucher Details</label>
                <textarea
                  rows={2}
                  value={cashReceiptNote}
                  onChange={e => setCashReceiptNote(e.target.value)}
                  placeholder="e.g. Received in cash at Civil Hospital distribution counter. Verified by hand."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                Collector Identity: <strong>{user?.name} ({currentVolunteer.volunteerId})</strong> will be stamped on this entry.
              </div>

              <button
                type="submit"
                disabled={submittingCash}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl mt-2 shadow transition-all disabled:opacity-50"
              >
                {submittingCash ? 'Recording...' : `Confirm & Save ₹${cashAmount} Hand Cash`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE DONATION STATUS & NOTES */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Update Donation Status</h3>
                <p className="text-slate-500 text-[11px]">ID: {selectedDonation.donationId}</p>
              </div>
              <button onClick={() => setSelectedDonation(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p><strong>Donor:</strong> {selectedDonation.donorName} ({selectedDonation.donorEmail})</p>
              <p><strong>Amount:</strong> {formatINR(selectedDonation.amount)} • Method: {selectedDonation.paymentMethod}</p>
              <p><strong>Campaign:</strong> {selectedDonation.campaignTitle}</p>
            </div>

            <form onSubmit={handleUpdateDonationStatus} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Status</label>
                <select
                  value={updateStatus}
                  onChange={e => setUpdateStatus(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                >
                  <option value="Verified">Verified (Volunteer Confirmed)</option>
                  <option value="Successful">Successful</option>
                  <option value="Verification Required">Verification Required</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Verification Remarks / Field Notes</label>
                <textarea
                  rows={3}
                  value={updateNotes}
                  onChange={e => setUpdateNotes(e.target.value)}
                  placeholder="e.g. Bank statement matched with cash receipt..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={submittingUpdate}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
              >
                {submittingUpdate ? 'Saving...' : 'Save Updated Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD DISTRIBUTION MISSION */}
      {showDistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-base text-slate-900">Record Distribution Mission</h3>
              <button onClick={() => setShowDistModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleRecordDistribution} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Campaign</label>
                <input
                  type="text"
                  required
                  value={distCamp}
                  onChange={e => setDistCamp(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Location of Distribution</label>
                <input
                  type="text"
                  required
                  value={distLoc}
                  onChange={e => setDistLoc(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Number of Meals Distributed</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={distMeals}
                  onChange={e => setDistMeals(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Field Observations & Notes</label>
                <textarea
                  rows={2}
                  value={distNotes}
                  onChange={e => setDistNotes(e.target.value)}
                  placeholder="e.g. Scanned 45 beneficiary QR passes. Food served warm."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                Submit Distribution Proof to Admin
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
