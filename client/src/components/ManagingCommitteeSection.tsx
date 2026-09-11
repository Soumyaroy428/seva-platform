'use client';

import React from 'react';
import { ICommitteeMember } from '@/lib/types';
import { Shield, Award, CheckCircle } from 'lucide-react';

interface ManagingCommitteeSectionProps {
  members: ICommitteeMember[];
}

export default function ManagingCommitteeSection({ members }: ManagingCommitteeSectionProps) {
  return (
    <section id="committee" className="py-20 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3.5 py-1 rounded-full">
            Governance & Ethics Board
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The Managing Committee
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Seva is steered by veteran humanitarian administrators, community activists, and certified auditors with zero personal profit motive.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {members.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200 transition-all flex flex-col justify-between group space-y-5"
            >
              <div className="space-y-4">
                <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-orange-200 shadow-md">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full shadow">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">{member.name}</h3>
                  <p className="text-xs font-bold text-orange-600">{member.designation}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed text-center">
                  {member.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-3xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Primary Responsibilities
                </p>
                <p className="text-[11px] font-semibold text-slate-700">
                  {member.responsibilities}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
