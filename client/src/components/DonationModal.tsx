'use client';

import React, { useState, useEffect } from 'react';
import { ICampaign, IDonation, IPaymentQR } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Heart, X, QrCode, AlertCircle, Copy, Check, Sparkles, Smartphone, ArrowRight, Loader2, MessageSquare, Layers, Upload, Info, ShieldCheck } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: ICampaign | null;
  onSuccess: (donation: IDonation) => void;
}

const PRESET_AMOUNTS = [20, 50, 100, 250, 500, 1000];

export default function DonationModal({ isOpen, onClose, campaign, onSuccess }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [paymentTab, setPaymentTab] = useState<'dynamic' | 'static'>('dynamic');
  const [transactionId, setTransactionId] = useState<string>('');
  const [proofFile, setProofFile] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [activeQRs, setActiveQRs] = useState<IPaymentQR[]>([]);
  const [selectedQR, setSelectedQR] = useState<IPaymentQR | null>(null);
  const [copiedUPI, setCopiedUPI] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Campaigns list for selector when not launched from specific campaign card
  const [allCampaigns, setAllCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaign?.id || campaign?._id || '');

  // Dynamic session state
  const [session, setSession] = useState<{
    paymentId: string;
    orderId: string;
    checkoutUrl: string;
    upiIntent: string;
    amount: string;
    donationId?: string;
  } | null>(null);

  // Fetch approved active static QRs for fallback tab
  useEffect(() => {
    if (isOpen) {
      fetch('/api/payment-qr')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            setActiveQRs(data.data);
            setSelectedQR(data.data[0]);
          }
        })
        .catch(err => console.error('Failed to load active QRs:', err));

      if (!campaign) {
        fetch('/api/campaigns')
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.data)) {
              setAllCampaigns(data.data);
              if (data.data.length > 0 && !selectedCampaignId) {
                setSelectedCampaignId(data.data[0].id || data.data[0]._id || '');
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, campaign, selectedCampaignId]);

  // Status Poller when dynamic session is open
  useEffect(() => {
    if (!session?.paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${session.paymentId}`);
        const data = await res.json();
        if (data.success && (data.status === 'SUCCESS' || data.status === 'Successful' || data.status === 'Verified') && data.donation) {
          clearInterval(interval);
          onSuccess(data.donation);
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [session, onSuccess]);

  if (!isOpen) return null;

  // Resolve target campaign
  const activeCampaign = campaign || allCampaigns.find(c => (c.id || c._id) === selectedCampaignId) || allCampaigns[0] || null;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    setSession(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setAmount(parsed);
      setSession(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const validateInputs = () => {
    if (isNaN(amount) || amount < 20) {
      setErrorMessage('Minimum donation accepted is ₹20 INR. Please enter at least ₹20.');
      return false;
    }
    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMessage('Please enter your full legal name and email to receive your official 80G tax receipt.');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(donorEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Payment proof file size must not exceed 5MB.');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitializeDynamicSession = async () => {
    if (!validateInputs()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorPhone: donorPhone.trim(),
          campaignId: activeCampaign?.id || activeCampaign?._id || 'CMP-1',
          campaignTitle: activeCampaign?.title || 'General Community Hunger Relief',
          isAnonymous,
          message: donorMessage.trim(),
          paymentMethod: 'UPI_DYNAMIC'
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment session');
      }

      setSession({
        paymentId: data.paymentId,
        orderId: data.orderId,
        checkoutUrl: data.checkoutUrl,
        upiIntent: data.upiIntent,
        amount: data.amount,
        donationId: data.donationId
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Payment service error. Please try again.');
    }
  };

  const handleManualQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setErrorMessage('Please enter the 12-digit UPI reference / UTR number from your payment app or bank SMS.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/manual-qr-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorPhone: donorPhone.trim(),
          campaignId: activeCampaign?.id || activeCampaign?._id || 'CMP-1',
          campaignTitle: activeCampaign?.title || 'General Community Hunger Relief',
          utr: transactionId.trim(),
          proofFile,
          message: donorMessage.trim(),
          isAnonymous,
          qrId: selectedQR?.qrId || selectedQR?.id || 'Approved QR'
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit manual payment for verification');
      }

      onSuccess(data.donation);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error submitting manual payment');
    }
  };

  const mealsCalculated = Math.max(1, Math.floor(amount / 25));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-orange-200 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-current" />
            <span>Sovereign Direct Giving</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Make a Verified Donation</h2>
          <p className="text-xs text-orange-100 mt-1">
            {activeCampaign ? `Supporting: ${activeCampaign.title}` : '100% Traceable. Every ₹25 provides 1 complete hot meal.'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Campaign Selection (If opened globally) */}
          {!campaign && allCampaigns.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>Select Relief Initiative</span>
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value);
                  setSession(null);
                }}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                {allCampaigns.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.title} ({c.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Selection with Strict ₹20 rule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Choose Contribution (INR ₹)
              </label>
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Min. ₹20 rule strictly enforced
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_AMOUNTS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAmountSelect(preset)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                    amount === preset
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            {/* Custom amount input */}
            <div className="mt-3 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="20"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter custom amount (≥ ₹20)"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Live meal impact callout */}
            <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Impact projection:</span>
              </div>
              <span className="font-extrabold text-orange-700">
                ~ {mealsCalculated} Wholesome Hot Meals
              </span>
            </div>
          </div>

          {/* Donor Information for 80G Receipt */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email for 80G Receipt *</label>
                <input
                  type="email"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone (Optional)</label>
                <input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span>Donate anonymously (Hide name on public roll)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Optional Message of Encouragement</span>
              </label>
              <textarea
                rows={2}
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                placeholder="Leave an encouraging note for the ground relief team..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Payment Mode Selector: Direct Dynamic UPI vs Static Bank QR */}
          <div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentTab('dynamic')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentTab === 'dynamic'
                    ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-400/20'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span>Instant UPI Checkout</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('static')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentTab === 'static'
                    ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-400/20'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-orange-600" />
                <span>Static Bank QR Code</span>
              </button>
            </div>

            {paymentTab === 'dynamic' ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                {!session ? (
                  <div className="text-center space-y-3">
                    <p className="text-xs text-slate-600">
                      Generate an instant dynamic UPI QR code or launch Google Pay, PhonePe, Paytm, or BHIM.
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleInitializeDynamicSession}
                      className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Initializing Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay ₹{amount} via Dynamic UPI</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center animate-in fade-in">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                      {/* Embedded Dynamic QR */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(session.upiIntent)}`}
                        alt="Dynamic UPI QR Code"
                        className="w-44 h-44 mx-auto rounded-lg"
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Scan with any UPI App or tap below on mobile:
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <a
                        href={session.upiIntent}
                        onClick={() => {
                          if (typeof window !== 'undefined' && session?.upiIntent) {
                            window.location.href = session.upiIntent;
                          }
                        }}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Open Installed UPI App</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard((session as any)?.upiPayeeAddress || process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || '6295804018@jio')}
                        className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        {copiedUPI ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedUPI ? 'UPI ID Copied' : 'Copy UPI ID'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-slate-600 bg-slate-100/90 py-1.5 px-3 rounded-lg border border-slate-200 inline-block">
                      Verified Payee: <span className="font-bold text-slate-800">{(session as any)?.upiPayeeAddress || process.env.NEXT_PUBLIC_PAYMENT_UPI_ID || '6295804018@jio'}</span> ({(session as any)?.upiPayeeName || process.env.NEXT_PUBLIC_PAYMENT_PAYEE_NAME || 'Soumya Roy'})
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                      <span>Waiting for bank confirmation (auto-reconciling)...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* STATIC QR CODE TAB — SECTION 5 NPCI & ADMIN APPROVAL COMPLIANCE */
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                {selectedQR ? (
                  <div className="space-y-4 text-center">
                    {/* Header info */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-left space-y-1.5 text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Merchant / Account:</span>
                        <span className="font-bold text-slate-800">{selectedQR.accountName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Designated Campaign:</span>
                        <span className="font-bold text-slate-800">{activeCampaign?.title || 'General Relief'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Contribution Amount:</span>
                        <span className="font-extrabold text-orange-600 text-sm">₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">UPI ID:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-700">{selectedQR.upiId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedQR.upiId)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500"
                            title="Copy UPI ID"
                          >
                            {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* QR Image Display */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                      <img
                        src={selectedQR.qrImageUrl}
                        alt="Admin Approved Static UPI QR"
                        className="w-44 h-44 mx-auto rounded-lg object-contain"
                      />
                    </div>

                    {/* NPCI Verified Instructions */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-left space-y-1 text-xs text-amber-950">
                      <p className="font-bold flex items-center gap-1 text-amber-900">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        <span>Payment Instructions:</span>
                      </p>
                      <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-amber-900/90">
                        <li>Scan this QR using Google Pay, PhonePe, Paytm, BHIM, or CRED.</li>
                        <li>Verify payee name: <strong>{selectedQR.accountName}</strong>.</li>
                        <li>Enter exact amount: <strong>₹{amount}</strong>.</li>
                        <li>After paying, copy the 12-digit UPI reference / UTR number from bank SMS or app receipt.</li>
                        <li>Enter the reference below and submit for Admin verification.</li>
                      </ol>
                    </div>

                    {/* Form for UTR & Proof Submission */}
                    <form onSubmit={handleManualQRSubmit} className="space-y-3 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          12-Digit Bank Reference / UTR Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 429810482910"
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Supporting Proof Screenshot (Optional)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Max 5MB</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-xs text-slate-600 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{proofFileName || 'Upload receipt screenshot / slip'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProofFileChange}
                              className="hidden"
                            />
                          </label>
                          {proofFile && (
                            <button
                              type="button"
                              onClick={() => { setProofFile(''); setProofFileName(''); }}
                              className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Submitting for Admin Review...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Submit Payment for Verification</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-1.5">
                          Under our Anti-Fraud policy, your payment will be held as <strong>PENDING_VERIFICATION</strong> until verified against actual bank credit.
                        </p>
                      </div>
                    </form>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No static QR codes active. Please use Instant UPI Checkout.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
