'use client';

import React, { useState, useEffect } from 'react';
import { ICampaign, IDonation, IPaymentQR } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Heart, X, QrCode, CreditCard, ShieldCheck, AlertCircle, Copy, Check, Sparkles } from 'lucide-react';
import RazorpayPaymentButton from './RazorpayPaymentButton';

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
  const [paymentMethod, setPaymentMethod] = useState<IDonation['paymentMethod']>('UPI');
  const [transactionId, setTransactionId] = useState<string>('');
  const [activeQRs, setActiveQRs] = useState<IPaymentQR[]>([]);
  const [selectedQR, setSelectedQR] = useState<IPaymentQR | null>(null);
  const [copiedUPI, setCopiedUPI] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch approved active QRs
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

  if (!isOpen) return null;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    setErrorMessage('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setCustomAmount(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
      if (parsed < 20) {
        setErrorMessage('Minimum donation is ₹20 according to Seva governance rules.');
      } else {
        setErrorMessage('');
      }
    } else {
      setAmount(0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const recordDonation = async (txnId: string) => {
    const payload = {
      donorName: isAnonymous ? 'Kind Supporter' : donorName,
      donorEmail,
      donorPhone,
      amount,
      campaignId: campaign?.id || campaign?._id,
      campaignTitle: campaign?.title || 'General Community Hunger Relief',
      paymentMethod,
      transactionId: txnId,
      isAnonymous,
      recurringFrequency
    };

    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      const msg = typeof json?.error === 'string' ? json.error : json?.error?.message || json?.message || 'Failed to process contribution';
      throw new Error(msg);
    }

    return json.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < 20) {
      setErrorMessage('Minimum donation accepted is ₹20. Please enter at least ₹20.');
      return;
    }

    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMessage('Please enter your full name and email to receive the 80G tax receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (paymentMethod === 'Card' || paymentMethod === 'Netbanking') {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) throw new Error('Razorpay SDK failed to load. Are you online?');

        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amount * 100 })
        });
        const orderData = await orderRes.json();
        if (!orderData.success) throw new Error(orderData.error || 'Failed to create Razorpay order');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Seva Humanitarian',
          description: campaign?.title || 'General Community Hunger Relief',
          order_id: orderData.order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.success) {
                setErrorMessage(verifyData.error || 'Payment verification failed');
                setIsSubmitting(false);
                return;
              }
              const donation = await recordDonation(response.razorpay_payment_id);
              onSuccess(donation);
            } catch (err: any) {
              setErrorMessage(err.message || 'Error recording verified payment');
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone
          },
          theme: {
            color: '#ea580c'
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMessage(response.error.description || 'Payment failed');
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        const txnId = transactionId || `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const donation = await recordDonation(txnId);
        onSuccess(donation);
      }
    } catch (err: any) {
      setErrorMessage(typeof err?.message === 'string' ? err.message : 'An error occurred while submitting payment.');
      setIsSubmitting(false);
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
            <span>Secure Social Giving</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Make a Verified Donation</h2>
          <p className="text-xs text-orange-100 mt-1">
            {campaign ? `Supporting: ${campaign.title}` : '100% Traceable. Every ₹25 provides 1 complete hot meal.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Donation Mode (One-time vs Recurring) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Frequency
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
              {(['None', 'Weekly', 'Monthly', 'Quarterly'] as const).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setRecurringFrequency(freq)}
                  className={`py-2 rounded-lg border text-center transition-all ${
                    recurringFrequency === freq
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {freq === 'None' ? 'One-Time' : freq}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'UPI' || paymentMethod === 'QR'
                    ? 'bg-orange-50 border-orange-500 text-orange-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-orange-600" />
                <span>UPI / QR Scan</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'Card'
                    ? 'bg-orange-50 border-orange-500 text-orange-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span>Card / Netbanking</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-orange-50 border-orange-500 text-orange-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <span>Bank / Offline</span>
              </button>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Email for Receipt *</label>
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

          {/* Submit Button */}
          {(paymentMethod === 'Card' || paymentMethod === 'UPI' || paymentMethod === 'QR') ? (
            <div className="w-full flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 mb-2 font-medium">Pay securely via Razorpay</p>
              <RazorpayPaymentButton paymentButtonId="pl_Tcn43SmpMvJvzp" />
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || amount < 20}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                amount < 20 || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/25 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <span>Verifying & Generating 80G Receipt...</span>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Complete Contribution of {formatINR(amount)}</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
