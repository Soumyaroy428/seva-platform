'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckSquare, 
  Square, 
  Search, 
  Users, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Calendar,
  X,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { ICampaign, IEmailRecipient, IUser } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface MonthlyDonationEmailSectionProps {
  userRole?: 'admin' | 'volunteer' | string;
  currentUser?: IUser | null;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500];

export default function MonthlyDonationEmailSection({ 
  userRole = 'volunteer', 
  currentUser 
}: MonthlyDonationEmailSectionProps) {
  // Recipients state
  const [recipients, setRecipients] = useState<IEmailRecipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState<boolean>(true);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Campaign & message composer state
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('250');
  const [emailSubject, setEmailSubject] = useState<string>('Join SEVA\'s Monthly Hunger Relief Pledge — Feed a Family in Need');
  const [customMessage, setCustomMessage] = useState<string>(
    'Namaste! As a field team member on the ground, I see firsthand the difference your support makes. A small monthly pledge helps us keep the kitchen fires burning and ensure no hungry child sleeps without dinner.'
  );

  // Dispatch & UI state
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    sentCount?: number;
    failedCount?: number;
    errors?: string[];
  } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Fetch recipients & active campaigns
  const fetchData = async () => {
    setLoadingRecipients(true);
    setSendResult(null);

    try {
      const [recipientsRes, campaignsRes] = await Promise.all([
        fetch('/api/email-campaigns/recipients').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/campaigns').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (recipientsRes && Array.isArray(recipientsRes.data)) {
        setRecipients(recipientsRes.data);
        // By default, select all valid recipients
        setSelectedEmails(new Set(recipientsRes.data.map((r: IEmailRecipient) => r.email)));
      }

      if (campaignsRes && Array.isArray(campaignsRes.data) && campaignsRes.data.length > 0) {
        setCampaigns(campaignsRes.data);
        setSelectedCampaignId(campaignsRes.data[0].id || campaignsRes.data[0]._id || 'CMP-1');
      }
    } catch (err) {
      console.error('Failed to load email outreach data:', err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter recipients
  const filteredRecipients = recipients.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (roleFilter === 'all') return true;
    if (roleFilter === 'donor') return r.totalDonated > 0 || r.role === 'donor';
    return r.role.toLowerCase() === roleFilter.toLowerCase();
  });

  // Toggle selection
  const handleToggleSelect = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === filteredRecipients.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredRecipients.map(r => r.email)));
    }
  };

  const handleAmountChange = (val: number) => {
    setMonthlyAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 20) {
      setMonthlyAmount(parsed);
    }
  };

  // Get active campaign details
  const activeCampaign = campaigns.find(c => (c.id || c._id) === selectedCampaignId) || campaigns[0] || null;
  const activeCampaignTitle = activeCampaign?.title || 'General Community Hunger Relief';
  const estimatedMeals = Math.max(1, Math.floor(monthlyAmount / 25));

  // Send requests
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmails.size === 0) {
      alert('Please select at least one recipient email.');
      return;
    }

    if (monthlyAmount < 20) {
      alert('Minimum donation amount policy is ₹20 INR.');
      return;
    }

    const confirmSend = window.confirm(
      `Confirm sending monthly donation request (₹${monthlyAmount}/month for "${activeCampaignTitle}") to ${selectedEmails.size} recipient(s)?`
    );
    if (!confirmSend) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/email-campaigns/send-monthly-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: Array.from(selectedEmails),
          campaignTitle: activeCampaignTitle,
          campaignId: selectedCampaignId,
          monthlyAmount,
          customMessage: customMessage.trim(),
          senderName: currentUser?.name || (userRole === 'admin' ? 'Chief Administrator' : 'Field Volunteer'),
          senderRole: userRole === 'admin' ? 'Administrator' : 'Volunteer'
        })
      });

      const data = await res.json();
      setIsSending(false);

      if (!res.ok || !data.success) {
        setSendResult({
          success: false,
          message: data.error || 'Failed to dispatch monthly request emails.'
        });
        return;
      }

      setSendResult({
        success: true,
        message: data.message || `Successfully sent monthly donation request emails to ${data.sentCount} recipient(s).`,
        sentCount: data.sentCount,
        failedCount: data.failedCount,
        errors: data.errors
      });
    } catch (err: any) {
      setIsSending(false);
      setSendResult({
        success: false,
        message: err.message || 'Network error while dispatching emails.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monthly Donor Pledge Campaign</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Monthly Donation Request & Email Outreach
          </h2>
          <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
            Reach out to registered supporters, volunteers, and past donors. Send an official monthly donation appeal email with an instant, direct <strong>&ldquo;Pay Now&rdquo;</strong> button powered by Resend.
          </p>
        </div>

        {/* Action button: Refresh */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loadingRecipients}
            className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Recipients List"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRecipients ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Recipients</span>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{recipients.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Registered in database</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Selected to Send</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600">{selectedEmails.size}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Active selection</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pledge / Month</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900">₹{monthlyAmount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Min ₹20 policy enforced</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Meal Impact / Gift</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-600">~{estimatedMeals} meals</div>
          <p className="text-[10px] text-slate-400 mt-0.5">₹25 per wholesome meal</p>
        </div>
      </div>

      {/* 3. Send Result Banner */}
      {sendResult && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in ${
          sendResult.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
            : 'bg-red-50 border-red-200 text-red-950'
        }`}>
          {sendResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold">
              {sendResult.success ? 'Request Broadcast Completed' : 'Email Dispatch Notice'}
            </h4>
            <p className="text-xs leading-relaxed opacity-90">{sendResult.message}</p>
            {sendResult.errors && sendResult.errors.length > 0 && (
              <div className="text-[11px] bg-white/60 p-2 rounded-lg space-y-0.5 font-mono text-slate-700 mt-2">
                <strong>Delivery Warnings:</strong>
                {sendResult.errors.map((e, idx) => (
                  <div key={idx}>• {e}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Two-Column Layout: (Left: Recipient Selection | Right: Email Composer & Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Recipient List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span>Select Registered Recipients</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedEmails.size} of {filteredRecipients.length} recipients selected
                </p>
              </div>

              {/* Master Select / Deselect */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 self-start sm:self-auto py-1 px-2.5 bg-orange-50 hover:bg-orange-100/80 rounded-lg transition-colors cursor-pointer"
              >
                {selectedEmails.size === filteredRecipients.length && filteredRecipients.length > 0 ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Select All</span>
                  </>
                )}
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-3">
              <div className="sm:col-span-7 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                />
              </div>
              <div className="sm:col-span-5">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 text-slate-700"
                >
                  <option value="all">All Registered Contacts</option>
                  <option value="donor">Donors Only (With Contribution)</option>
                  <option value="volunteer">Volunteers</option>
                  <option value="beneficiary">Beneficiaries</option>
                </select>
              </div>
            </div>

            {/* Recipients Scrollable Table */}
            <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {loadingRecipients ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-600" />
                  <p>Loading registered emails from database...</p>
                </div>
              ) : filteredRecipients.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <Mail className="w-6 h-6 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No registered recipients found</p>
                  <p className="text-[11px]">Try adjusting your search query or filter</p>
                </div>
              ) : (
                filteredRecipients.map((r) => {
                  const isSelected = selectedEmails.has(r.email);
                  return (
                    <div
                      key={r.email}
                      onClick={() => handleToggleSelect(r.email)}
                      className={`p-3 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isSelected ? 'bg-orange-50/50 hover:bg-orange-50' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent onClick
                          className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 truncate">{r.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              r.totalDonated > 0 
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.role === 'volunteer' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {r.totalDonated > 0 ? `Donor (${formatINR(r.totalDonated)})` : r.role}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 truncate block">
                            {r.email}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 text-[11px]">
                        {r.donationCount > 0 ? (
                          <span className="text-emerald-700 font-bold">
                            {r.donationCount} donation{r.donationCount === 1 ? '' : 's'}
                          </span>
                        ) : (
                          <span className="text-slate-400">Registered Supporter</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
            <span>Powered by official Resend Email API</span>
            <span className="font-semibold text-slate-600">{selectedEmails.size} targets ready</span>
          </div>
        </div>

        {/* Right Column: Email Campaign Composer (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Configure Monthly Appeal</span>
                </h3>
                <p className="text-[11px] text-slate-500">Includes direct &ldquo;Pay Now&rdquo; button</p>
              </div>

              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Email</span>
              </button>
            </div>

            {/* Campaign Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Campaign Initiative:</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 font-medium"
              >
                {campaigns.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Pledge Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Suggested Monthly Pledge:</label>
                <span className="text-[11px] font-bold text-orange-600">Feeds ~{estimatedMeals} meals/mo</span>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountChange(amt)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      monthlyAmount === amt
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="20"
                  step="10"
                  value={customAmount}
                  onChange={handleCustomAmountInput}
                  placeholder="Custom monthly amount (min ₹20)"
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 font-bold"
                />
              </div>
            </div>

            {/* Email Subject Line */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Subject Line:</label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject of the email..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 font-medium text-slate-900"
              />
            </div>

            {/* Personal Volunteer Appeal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Personal Note from {userRole === 'admin' ? 'Administrator' : 'Volunteer'}:</label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a heartfelt note or recent field update from your relief kitchen..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 text-slate-700 leading-relaxed"
              />
            </div>

            {/* Compliance Badge */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
              <div className="flex items-center gap-1 font-bold text-emerald-950">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Automatic 80G Tax Exemption Delivery:</span>
              </div>
              <p className="text-emerald-900/90 leading-relaxed text-[10.5px]">
                Recipients clicking <strong>&ldquo;Pay Now&rdquo;</strong> will be redirected to the SEVA platform checkout pre-filled with this campaign and amount, and will automatically receive an official 80G tax certificate immediately upon payment.
              </p>
            </div>

            {/* Send Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending || selectedEmails.size === 0}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Emails via Resend...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Monthly Request to {selectedEmails.size} Recipient{selectedEmails.size === 1 ? '' : 's'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-[10px] text-slate-400 text-center">
            Sender identity: <strong>{currentUser?.name || (userRole === 'admin' ? 'Chief Administrator' : 'Field Volunteer')}</strong> ({userRole})
          </p>
        </div>
      </div>

      {/* 5. Interactive Live Email Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-slate-900">Email Preview (As Recipient Sees It)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-5 rounded-xl text-center space-y-1">
                <h3 className="text-lg font-black tracking-wider">SEVA FOUNDATION</h3>
                <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase">
                  Monthly Hunger Relief Appeal
                </span>
              </div>

              {/* Body */}
              <div className="space-y-3 text-slate-700 leading-relaxed">
                <p>Namaste <strong>Supporter</strong>,</p>
                <p>
                  As part of our continuous hunger relief mission, we invite you to renew your compassionate commitment with a monthly contribution for <strong>{activeCampaignTitle}</strong>.
                </p>

                {customMessage && (
                  <div className="bg-slate-50 border-l-4 border-orange-500 p-3 rounded-r-xl italic text-slate-600">
                    &ldquo;{customMessage}&rdquo;
                    <div className="not-italic font-bold text-orange-600 text-[10px] mt-1">
                      — {currentUser?.name || (userRole === 'admin' ? 'Chief Administrator' : 'Field Volunteer')}
                    </div>
                  </div>
                )}

                {/* Appeal Card */}
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase text-orange-800 tracking-wider">Suggested Monthly Support</span>
                  <div className="text-2xl font-black text-orange-600">₹{monthlyAmount}</div>
                  <span className="inline-block bg-orange-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    🍲 Feeds ~{estimatedMeals} Wholesome Meals
                  </span>
                  <p className="text-[11px] text-orange-900/80 pt-1">
                    Your monthly gift ensures our community kitchen never runs out of rations for hungry children, daily wage earners, and elderly individuals.
                  </p>
                </div>

                {/* Pay Now Button Preview */}
                <div className="text-center pt-2 pb-1">
                  <span className="inline-block bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-xs tracking-wide">
                    👉 Click Here to Pay ₹{monthlyAmount} Now
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Direct NPCI UPI, PhonePe, GPay, Paytm & Instant 80G Tax Receipt.
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[10px] text-emerald-800">
                  <strong>Section 80G Tax Exemption:</strong> All donations are eligible for 50% tax deduction under Section 80G of the Indian Income Tax Act.
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
