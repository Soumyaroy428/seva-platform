'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ImpactStats from '@/components/ImpactStats';
import ActiveCampaigns from '@/components/ActiveCampaigns';
import HowItWorks from '@/components/HowItWorks';
import FoodRescueSection from '@/components/FoodRescueSection';
import RecentDistributions from '@/components/RecentDistributions';
import TransparencySection from '@/components/TransparencySection';
import ManagingCommitteeSection from '@/components/ManagingCommitteeSection';
import SuccessStoriesSection from '@/components/SuccessStoriesSection';
import FAQSection from '@/components/FAQSection';
import BottomAdminPortal from '@/components/BottomAdminPortal';
import Footer from '@/components/Footer';

import DonationModal from '@/components/DonationModal';
import ReceiptModal from '@/components/ReceiptModal';
import FoodDonationModal from '@/components/FoodDonationModal';
import VolunteerModal from '@/components/VolunteerModal';

import {
  ICampaign,
  ICampaignSectionSettings,
  IDistributionEvent,
  IDistributionSectionSettings,
  IExpense,
  ICommitteeMember,
  ISuccessStory,
  IStorySectionSettings,
  IDonation,
  IFoodDonation,
  IVolunteer,
  IHowItWorksStep,
  IFAQItem,
  IRightHeroCard,
  IVerifiedMetrics
} from '@/lib/types';
import { initialExpenses, initialCommitteeMembers } from '@/lib/db/mockData';

export default function HomePage() {
  // Modal states
  const [donateOpen, setDonateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(null);
  const [foodDonateOpen, setFoodDonateOpen] = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<IDonation | null>(null);

  // Dynamic Data states
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [campaignSectionSettings, setCampaignSectionSettings] = useState<ICampaignSectionSettings | null>(null);
  const [distributions, setDistributions] = useState<IDistributionEvent[]>([]);
  const [distributionSectionSettings, setDistributionSectionSettings] = useState<IDistributionSectionSettings | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>(initialExpenses);
  const [committee, setCommittee] = useState<ICommitteeMember[]>(initialCommitteeMembers);
  const [stories, setStories] = useState<ISuccessStory[]>([]);
  const [storySectionSettings, setStorySectionSettings] = useState<IStorySectionSettings | null>(null);
  const [howItWorksSteps, setHowItWorksSteps] = useState<IHowItWorksStep[]>([]);
  const [faqs, setFaqs] = useState<IFAQItem[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [verifiedMetrics, setVerifiedMetrics] = useState<IVerifiedMetrics | null>(null);
  const [heroCard, setHeroCard] = useState<IRightHeroCard | null>(null);

  // Fetch live API data on client mount
  useEffect(() => {
    fetch('/api/hero-cards')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setHeroCard(d.data);
        else setHeroCard(null);
      })
      .catch(() => setHeroCard(null));

    fetch('/api/campaigns/section-settings')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setCampaignSectionSettings(d.data); })
      .catch(() => {});

    fetch('/api/campaigns')
      .then(r => r.json())
      .then(d => { if (d.success) setCampaigns(d.data || []); })
      .catch(() => {});

    fetch('/api/distributions/section-settings')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setDistributionSectionSettings(d.data); })
      .catch(() => {});

    fetch('/api/distributions')
      .then(r => r.json())
      .then(d => { if (d.success) setDistributions(d.data || []); })
      .catch(() => {});

    fetch('/api/expenses')
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setExpenses(d.data); })
      .catch(() => {});

    fetch('/api/committee')
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setCommittee(d.data); })
      .catch(() => {});

    fetch('/api/stories/section-settings')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setStorySectionSettings(d.data); })
      .catch(() => {});

    fetch('/api/stories')
      .then(r => r.json())
      .then(d => { if (d.success) setStories(d.data || []); })
      .catch(() => {});

    fetch('/api/how-it-works')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.length > 0) setHowItWorksSteps(d.data); })
      .catch(() => {});

    fetch('/api/faq')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.length > 0) setFaqs(d.data); })
      .catch(() => {});

    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.success) setGlobalStats(d.data.stats); })
      .catch(() => {});

    fetch('/api/verified-metrics')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setVerifiedMetrics(d.data); })
      .catch(() => {});
  }, []);

  // Restore donation modal if user returns from external UPI app after a browser reload
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seva_active_donation_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < 30 * 60 * 1000)) {
          setDonateOpen(true);
        } else {
          localStorage.removeItem('seva_active_donation_session');
        }
      }
    } catch {}
  }, []);

  // Open donation modal if URL contains ?donate=true (e.g. from Monthly Request Email "Pay Now" button)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('donate') === 'true') {
        const campParam = params.get('campaign');
        if (campParam && campaigns.length > 0) {
          const matched = campaigns.find(c => (c.id || c._id) === campParam || c.slug === campParam);
          if (matched) setSelectedCampaign(matched);
        }
        setDonateOpen(true);
      }
    }
  }, [campaigns]);

  const handleOpenDonate = (campaign?: ICampaign) => {
    setSelectedCampaign(campaign || null);
    setDonateOpen(true);
  };

  const handleDonationSuccess = (donation: IDonation) => {
    try {
      localStorage.removeItem('seva_active_donation_session');
    } catch {}
    setDonateOpen(false);
    setActiveReceipt(donation);

    // Refresh campaigns and stats
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(d => { if (d.success) setCampaigns(d.data || []); });
    fetch('/api/campaigns/section-settings')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setCampaignSectionSettings(d.data); });
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.success) setGlobalStats(d.data.stats); });
    fetch('/api/verified-metrics')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setVerifiedMetrics(d.data); });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Header */}
      <Navbar
        onOpenDonate={() => handleOpenDonate()}
        onOpenFoodDonate={() => setFoodDonateOpen(true)}
        onOpenVolunteer={() => setVolunteerOpen(true)}
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection
          heroCard={heroCard}
          onOpenDonate={() => handleOpenDonate()}
          onOpenFoodDonate={() => setFoodDonateOpen(true)}
          onOpenVolunteer={() => setVolunteerOpen(true)}
        />

        {/* 2. Impact Statistics (Real-time DB Driven) */}
        <ImpactStats stats={verifiedMetrics || globalStats?.verifiedMetrics || globalStats} />

        {/* 3. Active Relief Campaigns */}
        <ActiveCampaigns
          campaigns={campaigns}
          sectionSettings={campaignSectionSettings}
          onSelectCampaign={(c) => handleOpenDonate(c)}
        />

        {/* 4. Full-Phase Traceable Lifecycle */}
        <HowItWorks steps={howItWorksSteps} />

        {/* 5. Food Rescue & Surplus Pickups */}
        <FoodRescueSection
          onOpenFoodDonate={() => setFoodDonateOpen(true)}
        />

        {/* 6. Recent Distributions & Proof Gallery */}
        <RecentDistributions
          distributions={distributions}
          sectionSettings={distributionSectionSettings}
        />

        {/* 7. Public Transparency Center & Expenses */}
        {/* <TransparencySection
          expenses={expenses}
        /> */}

        {/* 8. Success Stories */}
        <SuccessStoriesSection
          stories={stories}
          sectionSettings={storySectionSettings}
        />

        {/* 9. Managing Committee & Governance */}
        <ManagingCommitteeSection
          members={committee}
        />

        {/* 10. Frequently Asked Questions */}
        <FAQSection faqs={faqs} />

        {/* 11. Volunteers & Administrators Hub (CMS & Env Governed) */}
        <BottomAdminPortal
          onOpenDonate={() => handleOpenDonate()}
          onOpenVolunteer={() => setVolunteerOpen(true)}
        />
      </main>

      {/* Comprehensive Footer */}
      <Footer />

      {/* Interactive Modals */}
      <DonationModal
        isOpen={donateOpen}
        campaign={selectedCampaign}
        onClose={() => {
          try {
            localStorage.removeItem('seva_active_donation_session');
          } catch {}
          setDonateOpen(false);
        }}
        onSuccess={handleDonationSuccess}
      />

      <ReceiptModal
        donation={activeReceipt}
        isOpen={Boolean(activeReceipt)}
        onClose={() => setActiveReceipt(null)}
      />

      <FoodDonationModal
        isOpen={foodDonateOpen}
        onClose={() => setFoodDonateOpen(false)}
        onSuccess={(food) => {
          alert(`Thank you! Food pickup scheduled for ${food.estimatedServings} servings. Volunteer dispatched!`);
        }}
      />

      <VolunteerModal
        isOpen={volunteerOpen}
        onClose={() => setVolunteerOpen(false)}
        onSuccess={(vol) => {
          // Volunteer registered
        }}
      />
    </div>
  );
}
