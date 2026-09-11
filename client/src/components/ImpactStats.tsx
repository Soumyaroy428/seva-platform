'use client';

import React from 'react';
import { Utensils, Users, Award, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { formatINR } from '@/lib/utils';

import { IVerifiedMetrics } from '@/lib/types';

interface ImpactStatsProps {
  stats?: Partial<IVerifiedMetrics> | {
    totalDonated?: number;
    totalMealsServed?: number;
    totalPeopleHelped?: number;
    activeVolunteersCount?: number;
    totalDistributionsCount?: number;
    badgeText?: string;
    heading?: string;
    subheading?: string;
    mealsLabel?: string;
    mealsSublabel?: string;
    peopleLabel?: string;
    peopleSublabel?: string;
    volunteersLabel?: string;
    volunteersSublabel?: string;
    distributionsLabel?: string;
    distributionsSublabel?: string;
    donatedLabel?: string;
    donatedSublabel?: string;
  } | null;
}

export default function ImpactStats({ stats }: ImpactStatsProps) {
  // If admin does not write any number, make it 0 to all (no fake mock numbers)
  const totalMealsServed = Number(stats?.totalMealsServed) || 0;
  const totalPeopleHelped = Number(stats?.totalPeopleHelped) || 0;
  const activeVolunteersCount = Number(stats?.activeVolunteersCount) || 0;
  const totalDistributionsCount = Number(stats?.totalDistributionsCount) || 0;
  const totalDonated = Number(stats?.totalDonated) || 0;

  const badgeText = stats?.badgeText || 'REAL-TIME VERIFIED METRICS';
  const heading = stats?.heading || 'Every Rupee Accounted For, Every Meal Counted';
  const subheading = stats?.subheading || 'Data verified directly through ground distribution logs and administrator-reviewed photographic proof.';

  const statItems = [
    {
      icon: <Utensils className="w-6 h-6 text-orange-600" />,
      value: totalMealsServed > 0 ? totalMealsServed.toLocaleString('en-IN') + '+' : '0',
      label: stats?.mealsLabel || 'Wholesome Meals Served',
      sublabel: stats?.mealsSublabel || 'Cooked fresh & safely distributed'
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      value: totalPeopleHelped > 0 ? totalPeopleHelped.toLocaleString('en-IN') + '+' : '0',
      label: stats?.peopleLabel || 'Verified People Helped',
      sublabel: stats?.peopleSublabel || 'Unique individuals & families'
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      value: activeVolunteersCount > 0 ? activeVolunteersCount.toLocaleString('en-IN') + '+' : '0',
      label: stats?.volunteersLabel || 'Active Ground Volunteers',
      sublabel: stats?.volunteersSublabel || 'Verified ID badge holders'
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      value: totalDistributionsCount > 0 ? totalDistributionsCount.toLocaleString('en-IN') + '+' : '0',
      label: stats?.distributionsLabel || 'Distribution Events',
      sublabel: stats?.distributionsSublabel || 'Disaster camps & slum visits'
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-rose-600" />,
      value: formatINR(totalDonated),
      label: stats?.donatedLabel || '100% Traceable Aid',
      sublabel: stats?.donatedSublabel || 'Starting from ₹20 minimum'
    }
  ];

  return (
    <section className="py-14 bg-white border-y border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {badgeText}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-orange-200 hover:shadow-lg transition-all text-center space-y-2 group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {item.value}
              </h3>
              <div>
                <p className="text-xs font-bold text-slate-800">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
