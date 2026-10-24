'use client';

import React, { useState, useEffect } from 'react';
import { ICampaign, IDonation, IPaymentQR } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Heart, X, QrCode, ShieldCheck, AlertCircle, Copy, Check, Sparkles, Smartphone, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

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
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<IDonation['recurringFrequency']>('None');
  const [paymentTab, setPaymentTab] = useState<'dynamic' | 'static'>('dynamic');
  const [transactionId, setTransactionId] = useState<string>('');
  const [activeQRs, setActiveQRs] = useState<IPaymentQR[]>([]);
  const [selectedQR, setSelectedQR] = useState<IPaymentQR | null>(null);
  const [copiedUPI, setCopiedUPI] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Dynamic session state
  const [session, setSession] = useState<{
    paymentId: string;
    orderId: string;
    checkoutUrl: string;
    upiIntent: string;
    amount: string;
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
    }
  }, [isOpen]);

  // Status Poller when dynamic session is open
  useEffect(() => {
    if (!session?.paymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${session.paymentId}`);
        const data = await res.json();
        if (data.success && data.status === 'SUCCESS' && data.donation) {
          clearInterval(interval);
          onSuccess(data.donation);
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [session, onSuccess]);

  if (!isOpen) return null;

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

  const handleInitializeDynamicSession = async () => {
    if (amount < 20) {
      setErrorMessage('Minimum donation accepted is ₹20 INR. Please enter at least ₹20.');
      return;
    }
    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMessage('Please enter your full name and email to receive your official 80G tax receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donorName,
          donorEmail,
          donorPhone,
          campaignId: campaign?.id || campaign?._id,
          campaignTitle: campaign?.title || 'General Community Hunger Relief',
          isAnonymous
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
        amount: data.amount
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Payment service error. Please try again.');
    }
  };

  const handleManualConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 20) {
      setErrorMessage('Minimum donation accepted is ₹20 INR.');
      return;
    }
    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMessage('Please enter your full name and email to receive the 80G tax receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/verify-settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: session?.paymentId || `TXN-UPI-${Date.now()}`,
          utr: transactionId || `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          donorName,
          donorEmail,
          donorPhone,
          amount,
          campaignId: campaign?.id || campaign?._id,
          campaignTitle: campaign?.title,
          isAnonymous
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify contribution');
      }

      onSuccess(data.donation);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error recording verified payment');
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
            <span>Sovereign Direct UPI Giving</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Make a Verified Donation</h2>
          <p className="text-xs text-orange-100 mt-1">
            {campaign ? `Supporting: ${campaign.title}` : '100% Traceable. Every ₹25 provides 1 complete hot meal.'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                />
                <span>Donate anonymously (Hide my name on public donor roll)</span>
              </label>
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
                          <span>Generating UPI Session...</span>
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
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Open Installed UPI App</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('seva.humanitarian@upi')}
                        className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        {copiedUPI ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedUPI ? 'UPI ID Copied' : 'Copy UPI ID'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleManualConfirm}
                        className="text-xs text-orange-600 hover:text-orange-700 font-bold underline"
                      >
                        {isSubmitting ? 'Verifying payment...' : 'I have authorized the payment (Confirm Now)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* STATIC QR CODE TAB */
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                {selectedQR ? (
                  <div className="space-y-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                      <img
                        src={selectedQR.qrImageUrl}
                        alt="Approved UPI QR"
                        className="w-40 h-40 mx-auto rounded-lg object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700">{selectedQR.upiId}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedQR.upiId)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500"
                      >
                        {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 text-left">
                        Bank Reference / UTR Number
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="12-digit UPI reference number"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleManualConfirm}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-orange-500/20"
                    >
                      {isSubmitting ? 'Verifying...' : 'Submit UTR & Claim 80G Receipt'}
                    </button>
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
