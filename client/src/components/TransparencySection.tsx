'use client';

import React, { useState } from 'react';
import { IExpense } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { ShieldCheck, PieChart, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

interface TransparencySectionProps {
  expenses: IExpense[];
}

export default function TransparencySection({ expenses }: TransparencySectionProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = [
    { label: 'Food & Grains Procurement', percentage: 72, color: 'bg-orange-500' },
    { label: 'Field Logistics & Mobile Vans', percentage: 14, color: 'bg-emerald-500' },
    { label: 'Eco Packaging & Hygiene Kits', percentage: 8, color: 'bg-indigo-500' },
    { label: 'Admin, Audits & Platform', percentage: 6, color: 'bg-slate-400' }
  ];

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category.toLowerCase().includes(filterCategory.toLowerCase()));

  return (
    <section id="transparency" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            Financial Transparency Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Where Does Your ₹20+ Really Go?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            We believe in radical fiscal honesty. Over 86% of every single rupee goes straight into grains, fresh vegetables, cooking, and mobile relief vans.
          </p>
        </div>

        {/* Visual Allocation Breakdown */}
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-6 bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-600" />
              <span>Fund Utilization Ratio (FY 2026)</span>
            </h3>

            {/* Stacked bar visualization */}
            <div className="h-5 rounded-full overflow-hidden flex shadow-inner">
              {categories.map((c, i) => (
                <div
                  key={i}
                  className={`${c.color} h-full transition-all`}
                  style={{ width: `${c.percentage}%` }}
                  title={`${c.label}: ${c.percentage}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${c.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{c.label}</p>
                    <p className="text-sm font-black text-slate-900">{c.percentage}% of funds</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quarterly balance sheets audited by independent Chartered Accountants.</span>
            </div>
          </div>

          {/* Key Trust Guarantees */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Executive Extravagance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Management trustees draw no personal salaries from public donation pools. All core operational tools are built open and auditable.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Itemized Mandi Receipts</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every grain sack, vegetable crate, and cooking gas cylinder purchased is supported by a scanned wholesaler receipt visible in the ledger below.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Anti-Duplicate Beneficiary Protocol</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digital QR passes ensure that rations are distributed fairly across underprivileged settlements without ghost recipients.
              </p>
            </div>
          </div>
        </div>

        {/* Live Public Expense Ledger */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Recent Operational Disbursements</h3>
              <p className="text-xs text-slate-500">Live verified expenses logged by platform coordinators</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter:</span>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Categories</option>
                <option value="Food">Food Purchases</option>
                <option value="Transportation">Transportation</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-200/60 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 rounded-r-lg">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-white transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{exp.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{exp.campaignTitle}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 whitespace-nowrap">{formatINR(exp.amount)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Audited by {exp.approvedBy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
