'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Utensils,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  PlusCircle,
  QrCode
} from 'lucide-react';
import { IBeneficiary } from '@/lib/types';
import BeneficiaryPass from '@/components/BeneficiaryPass';

export default function BeneficiaryPortal() {
  const [beneficiaries, setBeneficiaries] = useState<IBeneficiary[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Request form state
  const [name, setName] = useState('');
  const [familyHeadName, setFamilyHeadName] = useState('');
  const [area, setArea] = useState('');
  const [householdSize, setHouseholdSize] = useState(4);
  const [category, setCategory] = useState<IBeneficiary['category']>('Daily Wage');

  useEffect(() => {
    fetch('/api/beneficiaries')
      .then(r => r.json())
      .then(d => { if (d.success) setBeneficiaries(d.data); });
  }, []);

  const currentBeneficiary: IBeneficiary = beneficiaries[0] || {
    id: 'ben-1',
    beneficiaryId: 'SEVA-BEN-30491',
    name: 'Lakshmi Devi',
    familyHeadName: 'Lakshmi Devi',
    area: 'Railway Colony Slum, Sector 4',
    householdSize: 5,
    category: 'Daily Wage',
    verificationStatus: 'Verified',
    mealsReceived: 142,
    lastAssistanceDate: '2026-09-04'
  };

  const handleSelfRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          familyHeadName,
          area,
          householdSize: Number(householdSize),
          category
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRequestModal(false);
        setFeedback('Assistance request registered! Digital QR Pass generated.');
        const refresh = await fetch('/api/beneficiaries').then(r => r.json());
        if (refresh.success) setBeneficiaries(refresh.data);
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Site</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wide text-white">BENEFICIARY AID PASS</h1>
                <p className="text-[10px] text-slate-400">Direct Food & Ration Entitlement</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apply for Ration Pass</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Digital Beneficiary Pass */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-black text-slate-900">Your Active Nutrition Pass</h2>
              <p className="text-xs text-slate-500">
                Scan this at any Seva kitchen van for quota collection.
              </p>
            </div>
            <BeneficiaryPass beneficiary={currentBeneficiary} />
          </div>

          {/* Right Column: Assistance History & Distribution Vans Nearby */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-black text-slate-900">Assistance History & Rations Received</h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-sm">Monthly Cooked Meal Ration</span>
                    <p className="text-slate-500">Distributed at Railway Colony Shed</p>
                    <span className="text-[10px] text-slate-400">Scanned by Volunteer Amitabh Roy</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-orange-600 text-sm">5 Portions</span>
                    <p className="text-[10px] text-emerald-600 font-bold">Collected 04 Sep</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-sm">Dry Ration Grocery Kit (15 Days)</span>
                    <p className="text-slate-500">Rice 10kg, Toor Dal 2kg, Cooking Oil 1L</p>
                    <span className="text-[10px] text-slate-400">Scanned by Volunteer Sneha Banerjee</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-indigo-600 text-sm">1 Kit</span>
                    <p className="text-[10px] text-emerald-600 font-bold">Collected 22 Aug</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm text-xs">
              <h3 className="text-base font-black text-slate-900">Upcoming Food Relief Vans in Your Area</h3>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Today 18:30 PM — Mobile Hunger Relief Van #2</span>
                </p>
                <p className="text-[11px] text-emerald-800">
                  Location: Railway Colony Slum Gate 3. Hot vegetable khichdi and fresh milk will be distributed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Assistance Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-base text-slate-900">Register for Seva Nutrition Support</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSelfRequest} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Saraswati Mondal"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Family Head Name</label>
                <input
                  type="text"
                  value={familyHeadName}
                  onChange={e => setFamilyHeadName(e.target.value)}
                  placeholder="Head of the family..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Household Members</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={householdSize}
                    onChange={e => setHouseholdSize(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Assistance Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="Daily Wage">Daily Wage Laborer</option>
                    <option value="Elderly">Elderly / Abandoned</option>
                    <option value="Disaster Affected">Disaster / Flood Affected</option>
                    <option value="Homeless">Homeless / Pavement</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Settlement Area / Address *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Sector 4 Slum, Shantipur"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              >
                Submit & Receive Digital QR Pass
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
