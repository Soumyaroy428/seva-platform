'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { IFAQItem } from '@/lib/types';

interface FAQSectionProps {
  faqs?: IFAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const displayFaqs = faqs && faqs.length > 0 ? faqs : [
    {
      id: 'faq-1',
      q: 'Why is there a minimum donation rule of ₹20?',
      a: 'In accordance with our PRD governance rules, ₹20 is the exact real-world cost of procuring wholesome raw staples (rice, lentils, spices) to cook 1 nutritious hot meal for a person in need. Any smaller transaction is eroded by banking/gateway payment interchange fees. Setting ₹20 as our hard floor ensures that 100% of the funds create tangible meals without payment waste.'
    },
    {
      id: 'faq-2',
      q: 'How does Seva ensure payment QR codes are authentic?',
      a: 'Under our strict Anti-Fraud protocol, any QR uploaded by a field volunteer or regional coordinator is held in "Pending" status and is completely hidden from donors. An Administrator must audit the UPI ID, bank account name, and operational authorization before approving it. Only verified active QRs appear on the public donation page.'
    },
    {
      id: 'faq-3',
      q: 'Can I claim tax deduction under Section 80G?',
      a: 'Yes. Every donation made on Seva automatically generates an official 80G-compliant digital receipt with a unique ID (e.g., SEVA-DON-2026-000123), organization trust registration number, and donor details, which you can immediately download or print for tax filing.'
    },
    {
      id: 'faq-4',
      q: 'How is surplus food checked for safety before distribution?',
      a: 'We strictly follow FSSAI temperature and sensory hygiene protocols. We only accept freshly cooked food with at least 4-6 hours of remaining shelf life. Food past its safe consumption deadline is automatically marked unavailable by our safety engine to prevent foodborne illness.'
    },
    {
      id: 'faq-5',
      q: 'How do volunteers receive their official Digital ID badge?',
      a: 'When an individual registers as a volunteer, their profile is vetted by our operations desk. Once approved, the volunteer receives a tamper-proof Digital Volunteer ID badge with a unique QR code (SEVA-VOL-XXXX) that can be verified on-site during ground distributions.'
    },
    {
      id: 'faq-6',
      q: 'Can I donate anonymously?',
      a: 'Yes. When donating, you can simply toggle the "Donate anonymously" checkbox. Your name will be hidden from the public donor roll and community feeds, while your 80G receipt is still securely emailed to you.'
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 px-3.5 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Clear Answers on Giving & Governance
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Everything you need to know about the minimum ₹20 donation, QR audit workflow, and food safety.
          </p>
        </div>

        <div className="space-y-3">
          {displayFaqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</span>
                <span className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
                  {openIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {openIdx === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
