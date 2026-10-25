'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  Calendar,
  Lock,
  X
} from 'lucide-react';
import { IDonation, ICampaign, IPaymentQR, PaymentStatus } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface PaymentManagementSectionProps {
  currentUser?: { name?: string; email?: string; role?: string } | null;
  campaigns: ICampaign[];
  qrs: IPaymentQR[];
  onRefreshStats?: () => void;
}

export default function PaymentManagementSection({
  currentUser,
  campaigns,
  qrs,
  onRefreshStats
}: PaymentManagementSectionProps) {
  const [donations, setDonations] = useState<IDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [selectedProof, setSelectedProof] = useState<{ url: string; donationId: string; donorName: string; utr?: string } | null>(null);
  const [rejectingDonation, setRejectingDonation] = useState<IDonation | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [auditDonation, setAuditDonation] = useState<IDonation | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // QR Management Drawer Toggle
  const [showQrManager, setShowQrManager] = useState(false);

  const fetchDonations = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDonations(data.data);
      }
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // Metrics
  const metrics = useMemo(() => {
    let totalVerifiedAmount = 0;
    let pendingCount = 0;
    let successCount = 0;
    let rejectedCount = 0;

    for (const d of donations) {
      const isSuccess = d.status === 'SUCCESS' || d.status === 'Successful' || d.status === 'Verified';
      if (isSuccess) {
        totalVerifiedAmount += d.amount || 0;
        successCount++;
      } else if (d.status === 'PENDING_VERIFICATION') {
        pendingCount++;
      } else if (d.status === 'REJECTED' || d.status === 'FAILED') {
        rejectedCount++;
      }
    }

    return { totalVerifiedAmount, pendingCount, successCount, rejectedCount, totalCount: donations.length };
  }, [donations]);

  // Pending Verifications Queue
  const pendingQueue = useMemo(() => {
    return donations.filter(d => d.status === 'PENDING_VERIFICATION');
  }, [donations]);

  // Filtered Ledger
  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = d.donationId?.toLowerCase().includes(q);
        const matchesName = d.donorName?.toLowerCase().includes(q);
        const matchesEmail = d.donorEmail?.toLowerCase().includes(q);
        const matchesUtr = d.transactionId?.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesUtr) return false;
      }

      // Status
      if (statusFilter !== 'ALL') {
        const s = (d.status || '').toUpperCase();
        if (statusFilter === 'SUCCESS') {
          if (s !== 'SUCCESS' && s !== 'SUCCESSFUL' && s !== 'VERIFIED') return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }

      // Campaign
      if (campaignFilter !== 'all') {
        if (d.campaignId !== campaignFilter && d.campaignTitle !== campaignFilter) return false;
      }

      // Method
      if (methodFilter !== 'all') {
        if ((d.paymentMethod || '').toUpperCase() !== methodFilter.toUpperCase()) return false;
      }

      // Date Range
      if (startDate && d.createdAt) {
        if (new Date(d.createdAt).getTime() < new Date(startDate).getTime()) return false;
      }
      if (endDate && d.createdAt) {
        if (new Date(d.createdAt).getTime() > new Date(endDate).getTime() + 86400000) return false;
      }

      return true;
    });
  }, [donations, searchQuery, statusFilter, campaignFilter, methodFilter, startDate, endDate]);

  // Admin Actions: Approve
  const handleApprove = async (donation: IDonation) => {
    const id = donation.donationId || donation.id;
    if (!id) return;
    if (!confirm(`Are you sure you want to approve donation ${donation.donationId} for ₹${donation.amount}?\n\nThis will authoritative mark it as SUCCESS, update campaign totals, generate an official 80G tax receipt, and dispatch confirmation notifications to the donor.`)) {
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/donations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: currentUser?.name || 'Chief Administrator',
          notes: `Verified against bank credit statement by ${currentUser?.name || 'Administrator'}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: `✅ Donation ${donation.donationId} approved! Official 80G Tax Receipt generated.`, type: 'success' });
        await fetchDonations();
        if (onRefreshStats) onRefreshStats();
      } else {
        setFeedback({ message: data.error || 'Failed to approve donation.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Error communicating with server.', type: 'error' });
    } finally {
      setSubmittingAction(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Admin Actions: Reject
  const handleConfirmReject = async () => {
    if (!rejectingDonation) return;
    if (!rejectionReason.trim()) {
      alert('Please specify an official reason for rejection.');
      return;
    }

    const id = rejectingDonation.donationId || rejectingDonation.id;
    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/donations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: currentUser?.name || 'Chief Administrator',
          rejectionReason: rejectionReason.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ message: `Donation ${rejectingDonation.donationId} marked as REJECTED. Donor has been notified.`, type: 'success' });
        setRejectingDonation(null);
        setRejectionReason('');
        await fetchDonations();
        if (onRefreshStats) onRefreshStats();
      } else {
        setFeedback({ message: data.error || 'Failed to reject donation.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Error communicating with server.', type: 'error' });
    } finally {
      setSubmittingAction(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (campaignFilter !== 'all') params.append('campaignId', campaignFilter);
    if (methodFilter !== 'all') params.append('paymentMethod', methodFilter);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    window.open(`/api/donations/export/csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-orange-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Financial Governance & Audit Desk
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Traceable
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Payment Verification & Management</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strict reconciliation control center. Review manual UPI QR submissions against official bank credits, verify automated gateway webhooks, issue 80G tax exemption certificates, and export audit ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrManager(!showQrManager)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4 text-orange-400" />
              <span>{showQrManager ? 'Hide QR Codes' : 'Manage QRs'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchDonations}
              disabled={refreshing}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-all border border-slate-700"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metric Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Verified Funds</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{metrics.totalVerifiedAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Strictly verified collections only</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pending Bank Review
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {metrics.pendingCount}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">Awaiting statement match</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Successful</div>
            <div className="text-2xl font-black text-white mt-1">
              {metrics.successCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">80G Receipts dispatched</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rejected / Failed</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {metrics.rejectedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Unmatched submissions</div>
          </div>
        </div>
      </div>

      {/* QR Code Quick Overview Drawer */}
      {showQrManager && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-600" />
                Approved Payment QR Codes
              </h3>
              <p className="text-xs text-slate-500">
                These approved NPCI QR codes are actively rendered in the donation modal for manual bank transfers.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {qrs.length} Registered
            </span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {qrs.map(qr => (
              <div key={qr.qrId || qr.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                <img src={qr.qrImageUrl} alt={qr.title} className="w-14 h-14 rounded-lg bg-white p-1 border border-slate-200 object-contain shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">{qr.title}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${qr.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {qr.status}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 truncate mt-0.5">{qr.upiId}</p>
                  <p className="text-[10px] text-slate-400 truncate">{qr.accountName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PENDING MANUAL VERIFICATION QUEUE (High Priority Alert Section) */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Pending Manual Verification Queue</h3>
                {pendingQueue.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">
                    {pendingQueue.length} Awaiting Review
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Donors who paid via static UPI QR. Reconcile transaction UTR against your bank statement before approving.
              </p>
            </div>
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-800">All Manual Payments Reconciled!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No manual UPI donations are currently awaiting bank statement review. New submissions will immediately appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingQueue.map(item => (
              <div key={item.donationId || item.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                        {item.donationId}
                      </span>
                      <span className="text-xs font-black text-slate-900">{item.donorName}</span>
                      {item.isAnonymous && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                          Anonymous on Web
                        </span>
                      )}
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{item.donorEmail}</span>
                      {item.donorPhone && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 font-mono">{item.donorPhone}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div>
                        <strong>Campaign:</strong> {item.campaignTitle || 'General Hunger Relief'}
                      </div>
                      <div>
                        <strong>Submitted:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Just now'}
                      </div>
                    </div>

                    {/* UTR Highlight Card */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Bank UTR / Ref:</span>
                        <span className="font-mono text-xs font-black text-slate-900 select-all">
                          {item.transactionId || 'None provided'}
                        </span>
                        {item.transactionId && (
                          <button
                            onClick={() => handleCopyUtr(item.transactionId!)}
                            className="text-amber-700 hover:text-amber-900 ml-1 p-0.5 rounded"
                            title="Copy UTR to clipboard"
                          >
                            {copiedUtr === item.transactionId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Supporting Proof Screenshot Button */}
                      {(item.proofFile || item.paymentProofUrl) && (
                        <button
                          onClick={() =>
                            setSelectedProof({
                              url: item.proofFile || item.paymentProofUrl || '',
                              donationId: item.donationId,
                              donorName: item.donorName,
                              utr: item.transactionId
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>View Proof Screenshot</span>
                        </button>
                      )}
                    </div>

                    {item.message && (
                      <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{item.message}"
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">₹{item.amount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] font-semibold text-amber-600 flex items-center sm:justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Pending Verification
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={submittingAction}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Payment</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingDonation(item);
                          setRejectionReason('Transaction reference not found on bank statement');
                        }}
                        disabled={submittingAction}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETE PAYMENT RECORDS & AUDIT LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              Complete Transaction Ledger & History
            </h3>
            <p className="text-xs text-slate-500">
              Authoritative record of all successful, pending, rejected, and refunded payments.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-900">{filteredDonations.length}</strong> of {donations.length} records
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, UTR, donor name, email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="SUCCESS">Verified SUCCESS</option>
              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Campaign Filter */}
          <div>
            <select
              value={campaignFilter}
              onChange={e => setCampaignFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="all">All Methods</option>
              <option value="UPI_MANUAL_QR">UPI Manual QR</option>
              <option value="UPI_DYNAMIC">UPI Dynamic / Intent</option>
              <option value="UPI">UPI Standard</option>
              <option value="CASH">Hand Cash</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="NETBANKING">Net Banking</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Donation ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Donor</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method / UTR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDonations.map(don => {
                  const isSuccess = don.status === 'SUCCESS' || don.status === 'Successful' || don.status === 'Verified';
                  const isPendingVerif = don.status === 'PENDING_VERIFICATION';
                  const isRejected = don.status === 'REJECTED' || don.status === 'FAILED';

                  return (
                    <tr key={don.donationId || don.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Donation ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {don.donationId}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {don.createdAt ? new Date(don.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>

                      {/* Donor */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 truncate max-w-[150px]">
                          {don.isAnonymous ? `${don.donorName} (Anon)` : don.donorName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{don.donorEmail}</div>
                      </td>

                      {/* Campaign */}
                      <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-[180px]">
                        {don.campaignTitle || 'General Hunger Relief'}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-black text-slate-900 whitespace-nowrap">
                        ₹{don.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Method & UTR */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">{don.paymentMethod || 'UPI'}</span>
                        {don.transactionId && (
                          <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px] flex items-center gap-1">
                            <span>{don.transactionId}</span>
                            <button
                              onClick={() => handleCopyUtr(don.transactionId!)}
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy"
                            >
                              {copiedUtr === don.transactionId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPendingVerif
                              ? 'bg-amber-100 text-amber-900'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSuccess && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                          {isPendingVerif && <Clock className="w-3 h-3 text-amber-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          {don.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Audit Trail */}
                          <button
                            onClick={() => setAuditDonation(don)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                            title="View Payment Audit History"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* View Proof Screenshot */}
                          {(don.proofFile || don.paymentProofUrl) && (
                            <button
                              onClick={() =>
                                setSelectedProof({
                                  url: don.proofFile || don.paymentProofUrl || '',
                                  donationId: don.donationId,
                                  donorName: don.donorName,
                                  utr: don.transactionId
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                              title="View Supporting Screenshot"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Inline Approve/Reject if pending */}
                          {isPendingVerif && (
                            <>
                              <button
                                onClick={() => handleApprove(don)}
                                className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingDonation(don);
                                  setRejectionReason('Transaction reference not found on bank statement');
                                }}
                                className="px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold text-[10px] hover:bg-rose-200 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PROOF SCREENSHOT VIEWER */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">Supporting Payment Evidence</h3>
              <p className="text-xs text-slate-500">
                Donation: <strong className="font-mono text-slate-900">{selectedProof.donationId}</strong> • Donor: {selectedProof.donorName}
              </p>
              {selectedProof.utr && (
                <div className="font-mono text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-2 inline-block">
                  Reported UTR: <strong>{selectedProof.utr}</strong>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-950 p-2 overflow-hidden flex items-center justify-center max-h-[460px]">
              <img
                src={selectedProof.url}
                alt="Payment Evidence"
                className="max-h-[440px] max-w-full rounded object-contain"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={selectedProof.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Original Image</span>
              </a>
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT PAYMENT VERIFICATION */}
      {rejectingDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setRejectingDonation(null);
                setRejectionReason('');
              }}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Reject Payment Verification</h3>
                <p className="text-xs text-slate-500">
                  Donation ID: <strong className="font-mono text-slate-900">{rejectingDonation.donationId}</strong> (₹{rejectingDonation.amount})
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Please provide an official reason for rejecting this payment submission. This reason will be logged in the permanent audit trail and communicated to the donor via email and SMS.
              </p>

              {/* Preset Chips */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Quick Reason Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Transaction reference not found on bank statement',
                    'Amount credited does not match reported amount',
                    'Duplicate transaction reference already recorded',
                    'Payment screenshot unreadable or incomplete'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setRejectingDonation(null);
                  setRejectionReason('');
                }}
                disabled={submittingAction}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={submittingAction || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{submittingAction ? 'Processing...' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDIT TRAIL VIEWER */}
      {auditDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setAuditDonation(null)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">Payment Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Donation: <strong className="font-mono text-slate-900">{auditDonation.donationId}</strong> • ₹{auditDonation.amount} INR
              </p>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Current Status:</span>
                  <div className="font-black text-slate-800">{auditDonation.status}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Verification Source:</span>
                  <div className="font-mono text-slate-800">{auditDonation.verificationSource || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Reviewed By:</span>
                  <div className="text-slate-800 font-semibold">{auditDonation.verifiedBy || 'Pending'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Reviewed At:</span>
                  <div className="text-slate-800 font-semibold">{auditDonation.verifiedAt ? new Date(auditDonation.verifiedAt).toLocaleString('en-IN') : 'Pending'}</div>
                </div>
              </div>

              {auditDonation.receiptNote && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Audit Notes / Receipt Memo:</span>
                  <p className="text-slate-700 italic mt-0.5">{auditDonation.receiptNote}</p>
                </div>
              )}

              {auditDonation.rejectionReason && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-rose-500 text-[10px] uppercase font-bold">Rejection Reason:</span>
                  <p className="text-rose-700 font-semibold mt-0.5">{auditDonation.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">Event History Timeline</span>
              {auditDonation.auditHistory && auditDonation.auditHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {auditDonation.auditHistory.map((h, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.action}</span>
                        <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-slate-600">{h.note}</div>
                      <div className="text-[10px] text-slate-400">Actor: {h.actor}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">No previous revision entries.</div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAuditDonation(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

