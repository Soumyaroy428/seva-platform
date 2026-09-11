'use client';

import React from 'react';
import { Utensils, ShieldCheck, Clock, Truck, ArrowRight, AlertCircle } from 'lucide-react';

interface FoodRescueSectionProps {
  onOpenFoodDonate: () => void;
}

export default function FoodRescueSection({ onOpenFoodDonate }: FoodRescueSectionProps) {
  return (
    <section id="food-rescue" className="py-16 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Utensils className="w-3.5 h-3.5" />
              <span>Zero Food Wastage Protocol</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Have Excess Food from a Wedding or Event? <br />
              <span className="text-emerald-400">We Pick Up & Feed Within Hours.</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Don't throw away edible nutritious food. Our temperature-controlled mobile vans and certified volunteers rescue surplus banquet food, verify hygiene standards, and deliver hot meals before safe consumption deadlines expire.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">Under 60 Mins</h4>
                <p className="text-[11px] text-slate-400">Rapid local volunteer pickup van dispatch</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">FSSAI Safety</h4>
                <p className="text-[11px] text-slate-400">Strict temperature & sensory quality checks</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm">Target Slums</h4>
                <p className="text-[11px] text-slate-400">Delivered directly to vetted shelters & families</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={onOpenFoodDonate}
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Schedule Emergency Food Pickup</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <span className="text-xs text-emerald-200/80 font-medium">
                24/7 Food Rescue Desk: <strong>+91 98234-FOOD-AID</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
