'use client';

import React from 'react';
import { CreditCard, ShoppingBag, Truck, UserCheck, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { IHowItWorksStep } from '@/lib/types';

interface HowItWorksProps {
  steps?: IHowItWorksStep[];
}

const defaultIcons = [
  <CreditCard key="1" className="w-6 h-6 text-orange-600" />,
  <ShoppingBag key="2" className="w-6 h-6 text-amber-600" />,
  <Truck key="3" className="w-6 h-6 text-emerald-600" />,
  <UserCheck key="4" className="w-6 h-6 text-indigo-600" />,
  <Smartphone key="5" className="w-6 h-6 text-rose-600" />,
];

export default function HowItWorks({ steps }: HowItWorksProps) {
  // If steps passed from backend (database), render exactly what admin wrote
  const displaySteps = steps && steps.length > 0 ? steps : [
    {
      id: 'step-1',
      number: '01',
      title: 'Contribution (≥ ₹20)',
      desc: 'Donor gives via verified UPI QR, Netbanking, or card. Every transaction receives an instant 80G digital receipt.'
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Bulk Kitchen Procurement',
      desc: 'Transparent bulk grocery purchases from wholesale mandis logged publicly in our real-time transparency center.'
    },
    {
      id: 'step-3',
      number: '03',
      title: 'Volunteer Operations',
      desc: 'Approved volunteers with digital ID badges collect fresh food and dispatch mobile hunger relief vans to target slums and disaster zones.'
    },
    {
      id: 'step-4',
      number: '04',
      title: 'Verified Distribution',
      desc: 'Beneficiaries receive warm meals; ground teams scan QR passes and upload geo-tagged photo proofs reviewed by Admins.'
    },
    {
      id: 'step-5',
      number: '05',
      title: 'Direct Donor Impact',
      desc: 'Donors receive automated monthly reports detailing exact meals served and communities nourished by their contribution.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3.5 py-1 rounded-full">
            Full-Phase Traceability
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Seva Works: From Your Wallet to Someone's Meal
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Unlike traditional non-profits where donation flow is opaque, Seva tracks every stage digitally with photographic proof.
          </p>
        </div>

        <div className={`grid md:grid-cols-3 lg:grid-cols-${Math.min(5, Math.max(3, displaySteps.length))} gap-6 relative`}>
          {displaySteps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col justify-between relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {defaultIcons[idx % defaultIcons.length] || <Sparkles className="w-6 h-6 text-orange-500" />}
                  </div>
                  <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-orange-400 transition-colors">
                    {step.number || `0${idx + 1}`}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Digitally Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
