'use client';

import React from 'react';
import { IDonation } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Heart, Printer, Download, CheckCircle, X, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  donation: IDonation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ donation, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top toolbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold tracking-wide">Official Verified Donation Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-8 print:p-0 space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xl font-black text-slate-900">SEVA FOUNDATION</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Reg. Trust No: SEVA/WB/2026/80G</p>
              <p className="text-xs text-slate-500">12 Hunger Relief Way, Sector 5, Salt Lake</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Payment Verified
              </span>
              <p className="text-xs font-mono font-bold text-slate-600 mt-2">{donation.donationId}</p>
              <p className="text-[11px] text-slate-400">
                {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Today'}
              </p>
            </div>
          </div>

          {/* Amount Callout */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-800">Total Contribution Received</p>
            <p className="text-4xl font-extrabold text-orange-600 mt-1">{formatINR(donation.amount)}</p>
            <p className="text-xs text-orange-700 mt-1 font-medium">
              Supporting approximately <span className="font-bold">{Math.floor(donation.amount / 25)} wholesome nutritious meals</span>
            </p>
          </div>

          {/* Donor & Transaction Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-semibold">Donor Name</span>
              <p className="font-bold text-slate-900">{donation.donorName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-semibold">Email</span>
              <p className="font-bold text-slate-900">{donation.donorEmail}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-semibold">Payment Mode</span>
              <p className="font-bold text-slate-900">{donation.paymentMethod}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-semibold">Transaction / UTR ID</span>
              <p className="font-mono font-bold text-slate-900">{donation.transactionId || 'Verified Instant'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <span className="text-slate-400 uppercase font-semibold">Allocated Campaign</span>
              <p className="font-bold text-slate-900">{donation.campaignTitle || 'General Hunger Relief & Kitchen Support'}</p>
            </div>
          </div>

          {/* Tax Exemption Note */}
          <div className="border-t border-dashed border-slate-300 pt-4 text-[11px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-0.5">80G Income Tax Exemption Eligibility:</p>
            Donations to Seva Welfare Trust are eligible for tax deduction under Section 80G of the Indian Income Tax Act. This digital receipt is an authentic proof of donation.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Digital Signature Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
