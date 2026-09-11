'use client';

import React from 'react';
import { IBeneficiary } from '@/lib/types';
import { ShieldCheck, Utensils, Users, MapPin, CheckCircle2 } from 'lucide-react';

interface BeneficiaryPassProps {
  beneficiary: IBeneficiary;
}

export default function BeneficiaryPass({ beneficiary }: BeneficiaryPassProps) {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden text-slate-800">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase">SEVA NUTRITION PASS</h4>
            <p className="text-[10px] text-indigo-200">Community Meal & Ration Identity</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {beneficiary.verificationStatus}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beneficiary / Head</span>
            <h3 className="text-base font-extrabold text-slate-900">{beneficiary.name}</h3>
            <p className="text-xs font-mono font-bold text-indigo-700">{beneficiary.beneficiaryId}</p>
          </div>

          <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https://seva.org/verify-ben/${beneficiary.beneficiaryId}`}
              alt="Beneficiary QR Pass"
              className="w-14 h-14 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Family Size: <strong className="text-slate-900">{beneficiary.householdSize} members</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Utensils className="w-3.5 h-3.5 text-indigo-600" />
            <span>Meals Claimed: <strong className="text-slate-900">{beneficiary.mealsReceived}</strong></span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-slate-700 pt-1 border-t border-slate-200/60 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{beneficiary.area}</span>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400">
          Show this QR code at any Seva Distribution Van or Kitchen Center for immediate meal claim.
        </div>
      </div>
    </div>
  );
}
