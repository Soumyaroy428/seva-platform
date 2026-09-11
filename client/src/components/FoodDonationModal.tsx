'use client';

import React, { useState } from 'react';
import { X, Utensils, Clock, ShieldAlert, CheckCircle, MapPin, Phone } from 'lucide-react';
import { IFoodDonation } from '@/lib/types';

interface FoodDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (foodDonation: IFoodDonation) => void;
}

export default function FoodDonationModal({ isOpen, onClose, onSuccess }: FoodDonationModalProps) {
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [estimatedServings, setEstimatedServings] = useState(50);
  const [safeUntilHours, setSafeUntilHours] = useState(6);
  const [dietaryCategory, setDietaryCategory] = useState<IFoodDonation['dietaryCategory']>('Vegetarian');
  const [packaging, setPackaging] = useState('Sealed Steel Containers');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('Within 2 Hours');
  const [notes, setNotes] = useState('');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyAgreed) {
      setErrorMessage('You must confirm food safety hygiene standards before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const safeUntil = new Date(Date.now() + safeUntilHours * 3600 * 1000).toISOString();

      const payload = {
        donorName,
        donorPhone,
        foodType,
        quantity: quantity || `${estimatedServings} meal portions`,
        estimatedServings: Number(estimatedServings),
        preparedAt: new Date().toISOString(),
        safeUntil,
        dietaryCategory,
        packaging,
        pickupLocation,
        pickupTime,
        notes
      };

      const res = await fetch('/api/food-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit food donation');
      }

      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error scheduling food pickup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Zero Food Waste Mission</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Donate Surplus Food</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Connect surplus cooked food from weddings, banquets, and kitchens to hungry families within safe consumption hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Donor / Entity Name *</label>
              <input
                type="text"
                required
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                placeholder="e.g. Grand Emerald Banquets"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Mobile *</label>
              <input
                type="tel"
                required
                value={donorPhone}
                onChange={e => setDonorPhone(e.target.value)}
                placeholder="+91 98300 XXXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Food Item Details *</label>
            <input
              type="text"
              required
              value={foodType}
              onChange={e => setFoodType(e.target.value)}
              placeholder="e.g. Cooked Biryani, Paneer Gravy, Rotis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Approx. Servings *</label>
              <input
                type="number"
                min="10"
                required
                value={estimatedServings}
                onChange={e => setEstimatedServings(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dietary Tag</label>
              <select
                value={dietaryCategory}
                onChange={e => setDietaryCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain Pure</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Safe Hours Left *</label>
              <select
                value={safeUntilHours}
                onChange={e => setSafeUntilHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
              >
                <option value={4}>4 Hours</option>
                <option value={6}>6 Hours</option>
                <option value={8}>8 Hours</option>
                <option value={12}>12 Hours (Refrigerated)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pickup Address / Land mark *</label>
            <textarea
              required
              rows={2}
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
              placeholder="Full location, entrance gate, and parking details for dispatch van..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Food Safety Declaration */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>FSSAI Food Safety Protocol</span>
            </div>
            <label className="flex items-start gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                required
                checked={safetyAgreed}
                onChange={e => setSafetyAgreed(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] leading-tight">
                I certify that this food was prepared hygienically, stored at safe temperatures, and is unadulterated and safe for human consumption.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !safetyAgreed}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
              !safetyAgreed || isSubmitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-600/20'
            }`}
          >
            {isSubmitting ? 'Dispatching Nearest Van...' : 'Schedule Instant Volunteer Food Rescue'}
          </button>
        </form>
      </div>
    </div>
  );
}
