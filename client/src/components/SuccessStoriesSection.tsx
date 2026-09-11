'use client';

import React from 'react';
import { ISuccessStory, IStorySectionSettings } from '@/lib/types';
import { MapPin, Calendar, Quote, CheckCircle2 } from 'lucide-react';

interface SuccessStoriesSectionProps {
  stories: ISuccessStory[];
  sectionSettings?: IStorySectionSettings | null;
}

export default function SuccessStoriesSection({ stories, sectionSettings }: SuccessStoriesSectionProps) {
  // 1. Strict guard: If admin disabled the section toggle -> remove div completely from DOM
  if (sectionSettings?.isEnabled === false) {
    return null;
  }

  // 2. Strict guard: If admin has not written/given any stories -> remove div completely from DOM
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section id="stories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
            {sectionSettings?.badgeText || 'Human Impact'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {sectionSettings?.heading || 'Stories of Hope, Dignity & Survival'}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            {sectionSettings?.subheading || 'Behind every ₹20 or ₹500 donated is a living human being whose day was made brighter with food, compassion, and community respect.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {stories.map(story => (
            <div
              key={story.id}
              className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="relative h-64 w-full bg-slate-200">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{sectionSettings?.consentBadgeText || 'Beneficiary Consent Verified'}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-orange-600 font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      {story.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {story.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="p-4 bg-orange-50/80 rounded-2xl border border-orange-100/80 flex items-start gap-3">
                  <Quote className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-orange-900 leading-normal">
                    {story.impactText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
