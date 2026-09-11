'use client';

import React, { useState } from 'react';
import { X, UserCheck, CheckCircle, ShieldCheck } from 'lucide-react';
import { IVolunteer } from '@/lib/types';
import DigitalVolunteerID from './DigitalVolunteerID';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (volunteer: IVolunteer) => void;
}

const AVAILABLE_SKILLS = [
  'Food Quality & Safety',
  'Van / Vehicle Driving',
  'First Aid & Medical Assistance',
  'Crowd Control & Queues',
  'Inventory & Packaging',
  'Field Photography & Proofs',
  'Language Translation'
];

export default function VolunteerModal({ isOpen, onClose, onSuccess }: VolunteerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [availability, setAvailability] = useState<IVolunteer['availability']>('Weekends');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Food Quality & Safety', 'Crowd Control & Queues']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredVolunteer, setRegisteredVolunteer] = useState<IVolunteer | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name,
        email,
        phone,
        area,
        availability,
        skills: selectedSkills.length > 0 ? selectedSkills : ['General Logistics']
      };

      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit application');
      }

      setRegisteredVolunteer(json.data);
      onSuccess(json.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Join Seva Ground Task Force</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Volunteer Registration</h2>
          <p className="text-xs text-slate-300 mt-1">
            Receive verified missions: food collection from kitchens, mobile van distribution, and beneficiary verification.
          </p>
        </div>

        {registeredVolunteer ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Welcome to the Seva Corps!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your application has been registered. Here is your temporary Digital Volunteer ID Badge.
              </p>
            </div>

            <DigitalVolunteerID volunteer={registeredVolunteer} />

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close & View Volunteer Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sneha Roy"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98300 XXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sneha@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Availability *</label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  <option value="Weekends">Weekends Only</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Full-Time">Full-Time Humanitarian</option>
                  <option value="Emergency Call">Emergency Disaster Call</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Operational City / Area *</label>
              <input
                type="text"
                required
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="e.g. North Zone, Sector 5 & Salt Lake"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Select Your Key Skills</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition-all mt-2"
            >
              {isSubmitting ? 'Registering & Generating ID...' : 'Register as Official Volunteer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
