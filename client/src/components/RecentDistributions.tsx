'use client';

import React from 'react';
import { IDistributionEvent, IDistributionSectionSettings } from '@/lib/types';
import { ShieldCheck, MapPin, Calendar, Users, Utensils, Camera } from 'lucide-react';

interface RecentDistributionsProps {
  distributions?: IDistributionEvent[];
  sectionSettings?: IDistributionSectionSettings | null;
}

export default function RecentDistributions({ distributions, sectionSettings }: RecentDistributionsProps) {
  // If section is disabled by admin OR admin has not given any distributions, remove this div completely from the main website DOM
  if (sectionSettings?.isEnabled === false) {
    return null;
  }

  const distList = (distributions || []).filter(d => d.status !== 'Draft');
  if (distList.length === 0) {
    return null;
  }

  const badgeText = sectionSettings?.badgeText || 'Field Evidence & Verification';
  const heading = sectionSettings?.heading || 'Recent Ground Distributions';
  const subheading = sectionSettings?.subheading || 'Photographs, beneficiary headcounts, and field volunteer logs uploaded directly after every meal distribution.';
  const verifiedBadgeText = sectionSettings?.verifiedBadgeText || 'Admin Reviewed & Approved';

  return (
    <section id="distributions" className="py-16 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {badgeText}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
              {heading}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              {subheading}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>{verifiedBadgeText}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {distList.map((event) => (
            <div
              key={event.id || event.eventId}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 transition-all grid sm:grid-cols-12"
            >
              {/* Photo Proof */}
              <div className="sm:col-span-5 relative h-56 sm:h-auto bg-slate-100">
                <img
                  src={event.proofPhoto || (event.proofPhotos && event.proofPhotos[0]) || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop'}
                  alt={`Distribution proof at ${event.location}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>Geo Proof</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Event Details */}
              <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{event.eventId || (event.id ? String(event.id).slice(-8) : 'SEVA-DIST')}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.date}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {event.campaignTitle}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>{event.location}</span>
                  </div>

                  {event.notes && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {event.notes}
                    </p>
                  )}
                </div>

                {/* Quantitative Impact Badges */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-orange-50/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase text-orange-800 block">Meals Given</span>
                    <span className="text-base font-black text-orange-600">
                      {event.mealsDistributed}
                    </span>
                  </div>
                  <div className="bg-indigo-50/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] font-bold uppercase text-indigo-800 block">Families Fed</span>
                    <span className="text-base font-black text-indigo-600">
                      {event.beneficiariesCount}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Volunteers on ground: <strong className="text-slate-700">
                    {Array.isArray(event.volunteersInvolved)
                      ? event.volunteersInvolved.join(', ')
                      : event.volunteersInvolved || (Array.isArray(event.volunteersAssigned) ? event.volunteersAssigned.join(', ') : 'Ground Volunteers')}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
