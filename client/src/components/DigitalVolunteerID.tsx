'use client';

import React from 'react';
import { IVolunteer } from '@/lib/types';
import { ShieldCheck, Heart, User, MapPin, Calendar, Award } from 'lucide-react';

interface DigitalVolunteerIDProps {
  volunteer: IVolunteer;
}

export default function DigitalVolunteerID({ volunteer }: DigitalVolunteerIDProps) {
  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-700 relative">
      {/* Decorative top lanyard band */}
      <div className="h-3 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />

      {/* Card Header */}
      <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase">SEVA RELIEF CORPS</h4>
            <p className="text-[10px] text-slate-400">Official Humanitarian Field Badge</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          volunteer.status === 'Approved'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {volunteer.status}
        </span>
      </div>

      {/* Card Center Body */}
      <div className="p-5 space-y-4">
        <div className="flex gap-4 items-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-xl bg-slate-700 border-2 border-orange-500/50 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            <User className="w-10 h-10 text-slate-400" />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white leading-tight">{volunteer.name}</h3>
            <p className="text-xs font-mono font-bold text-orange-400">{volunteer.volunteerId}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{volunteer.area}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Avail: {volunteer.availability}</span>
            </div>
          </div>
        </div>

        {/* Skills Pills */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Authorized Skills</p>
          <div className="flex flex-wrap gap-1">
            {volunteer.skills.map((skill, idx) => (
              <span key={idx} className="text-[10px] bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-600">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Impact Counters & QR Code */}
        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-slate-200">{volunteer.hoursLogged} Hours Logged</span>
            </div>
            <p className="text-[10px] text-slate-400">{volunteer.tasksCompleted} Verified Missions</p>
          </div>

          {/* Verification QR */}
          <div className="p-1 bg-white rounded-lg shadow">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https://seva.org/verify-vol/${volunteer.volunteerId}`}
              alt="Volunteer Verification QR"
              className="w-12 h-12 rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-950/60 px-5 py-2 text-center text-[9px] text-slate-500 font-mono">
        Official ID for field distribution & disaster rescue operations.
      </div>
    </div>
  );
}
