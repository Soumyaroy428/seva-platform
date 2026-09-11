'use client';

import React from 'react';
import { ICampaign, ICampaignSectionSettings } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { Heart, MapPin, AlertTriangle, Users, Utensils, Share2 } from 'lucide-react';

interface ActiveCampaignsProps {
  campaigns?: ICampaign[];
  sectionSettings?: ICampaignSectionSettings | null;
  onSelectCampaign: (campaign: ICampaign) => void;
}

export default function ActiveCampaigns({ campaigns, sectionSettings, onSelectCampaign }: ActiveCampaignsProps) {
  // If section is disabled by admin OR admin has not given any campaigns, remove this div completely from the main website
  if (sectionSettings?.isEnabled === false) {
    return null;
  }

  const activeCamps = (campaigns || []).filter(c => c.status === 'Active');
  if (activeCamps.length === 0) {
    return null;
  }

  const badgeText = sectionSettings?.badgeText || 'Active Relief Missions';
  const heading = sectionSettings?.heading || 'Support an Active Campaign';
  const subheading = sectionSettings?.subheading || '100% of your funds go directly into verified grocery procurement, kitchen prep, and volunteer field dispatches.';
  const minDonationText = sectionSettings?.minDonationText || 'Minimum Donation: ₹20 INR';

  const handleShare = (camp: ICampaign) => {
    if (navigator.share) {
      navigator.share({
        title: camp.title,
        text: `Support ${camp.title} on Seva Platform. Every ₹20 provides hot meals!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Campaign link copied to clipboard!');
    }
  };

  return (
    <section id="campaigns" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3 py-1 rounded-full">
              {badgeText}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
              {heading}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              {subheading}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span>{minDonationText}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeCamps.map((camp) => {
            const percentage = Math.min(100, Math.round((camp.collectedAmount / camp.targetAmount) * 100));

            return (
              <div
                key={camp.id || camp._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/80 hover:border-orange-300 transition-all flex flex-col overflow-hidden group"
              >
                {/* Cover Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                  <img
                    src={camp.coverImage}
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {camp.isEmergency && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Urgent Emergency</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {camp.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">{camp.location}</span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                      {camp.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  {/* Progress & Target */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-orange-600">{formatINR(camp.collectedAmount)}</span>
                      <span className="text-slate-400 font-medium">of {formatINR(camp.targetAmount)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Mini metrics */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-orange-500" />
                        <span><strong>{camp.mealsSupported.toLocaleString()}</strong> meals</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Users className="w-3 h-3 text-indigo-500" />
                        <span><strong>{camp.donorCount}</strong> donors</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectCampaign(camp)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/15 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>Donate (₹20+)</span>
                    </button>
                    <button
                      onClick={() => handleShare(camp)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      title="Share Campaign"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
