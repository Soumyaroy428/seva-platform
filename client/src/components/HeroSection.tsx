'use client';

import React from 'react';
import { Heart, Utensils, UserCheck, ShieldCheck, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { IRightHeroCard } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface HeroSectionProps {
  heroCard?: IRightHeroCard | null;
  onOpenDonate: () => void;
  onOpenFoodDonate: () => void;
  onOpenVolunteer: () => void;
}

export default function HeroSection({
  heroCard,
  onOpenDonate,
  onOpenFoodDonate,
  onOpenVolunteer
}: HeroSectionProps) {
  // Check if admin has written data for Right Hero Visual Cards
  const hasHeroCard = Boolean(
    heroCard &&
    heroCard.isActive !== false &&
    ((heroCard.title && heroCard.title.trim().length > 0) ||
     (heroCard.imageUrl && heroCard.imageUrl.trim().length > 0))
  );

  // Calculate progress percentage
  const progressPercent = hasHeroCard
    ? (heroCard!.progressPercentage && heroCard!.progressPercentage > 0
        ? Math.min(100, Math.max(0, heroCard!.progressPercentage))
        : (heroCard!.goalAmount && heroCard!.goalAmount > 0
            ? Math.min(100, Math.round(((heroCard!.raisedAmount || 0) / heroCard!.goalAmount) * 100))
            : 0))
    : 0;

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-orange-50/50 via-white to-amber-50/30">
      {/* Subtle background blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-orange-200/30 to-amber-200/30 blur-3xl -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${hasHeroCard ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-12 items-center`}>
          {/* Left Hero Content */}
          <div className={`${hasHeroCard ? 'lg:col-span-7 text-center lg:text-left' : 'lg:col-span-12 max-w-3xl mx-auto text-center'} space-y-8`}>
            {/* Top trust pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-900 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>India’s First Traceable Social Food Network</span>
              <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">Min. ₹20</span>
            </div>

            {/* Vision Tagline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Your Contribution. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
                  Someone's Meal.
                </span> <br />
                Someone's Hope.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Seva makes giving simple, transparent, and direct. Trace every ₹20+ contribution straight to a freshly cooked meal, verified on the ground with photo proof and digital audit trails.
              </p>
            </div>

            {/* 3 Primary CTAs */}
            <div className={`flex flex-col sm:flex-row items-center justify-center ${hasHeroCard ? 'lg:justify-start' : 'lg:justify-center'} gap-4`}>
              <button
                onClick={onOpenDonate}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                <span>Donate Now (₹20+)</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenFoodDonate}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Feed Someone (Surplus Food)</span>
              </button>

              <button
                onClick={onOpenVolunteer}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-slate-600" />
                <span>Become a Volunteer</span>
              </button>
            </div>

            {/* Verification highlights badge */}
            <div className={`pt-4 border-t border-orange-100/80 grid grid-cols-3 gap-3 ${hasHeroCard ? 'text-left' : 'text-center justify-items-center'}`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant 80G Receipt</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Admin Approved QRs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Geo-Tagged Proofs</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Cards - ONLY rendered if admin has written data */}
          {hasHeroCard && (
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Image Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 transition-all hover:shadow-orange-500/10">
                  {heroCard!.imageUrl ? (
                    <img
                      src={heroCard!.imageUrl}
                      alt={heroCard!.title || 'Hero Visual Card'}
                      className="w-full h-80 object-cover"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold p-6 text-center">
                      {heroCard!.title}
                    </div>
                  )}
                  <div className="p-5 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800">
                        {heroCard!.badgeText || 'Live Field Dispatch'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {heroCard!.timeAgo || 'Just now'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2">
                      {heroCard!.title}
                    </h4>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Raised: {formatINR(heroCard!.raisedAmount || 0)}</span>
                      <span className="text-orange-600 font-bold">
                        Goal: {formatINR(heroCard!.goalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating verified impact card */}
                {heroCard!.showImpactCard !== false && (
                  <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-orange-100 max-w-[220px] hidden sm:block animate-bounce-slow">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                        {heroCard!.impactCardIcon || '✓'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {heroCard!.impactCardTag || 'Direct Impact'}
                        </p>
                        <p className="text-xs font-black text-slate-900">
                          {heroCard!.impactCardText || '₹20 = 1 Nourishing Meal'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating volunteer card */}
                {heroCard!.showVolunteerCard !== false && (
                  <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur rounded-2xl p-3.5 shadow-xl border border-slate-100 max-w-[190px] hidden sm:block">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                        {heroCard!.volunteerCardIcon || '★'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          {heroCard!.volunteerCardTag || 'Volunteers'}
                        </p>
                        <p className="text-xs font-black text-slate-900">
                          {heroCard!.volunteerCardText || '840+ Active on Field'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

