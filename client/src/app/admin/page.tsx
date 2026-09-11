'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Heart,
  Users,
  QrCode,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  PlusCircle,
  Search,
  ArrowLeft,
  ArrowRight,
  Settings,
  BookOpen,
  Trash2,
  Edit3,
  Sliders,
  LogOut,
  Sparkles,
  Lock,
  Phone,
  Clock,
  ExternalLink,
  MapPin,
  Check,
  Ban,
  Layers,
  Truck,
  HelpCircle,
  ChevronRight,
  Database,
  Utensils,
  Award,
  HeartHandshake,
  RotateCcw,
  BarChart3,
  Eye,
  EyeOff,
  PauseCircle,
  PlayCircle,
  Camera
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import {
  IPaymentQR,
  IVolunteer,
  ICampaign,
  ICampaignSectionSettings,
  IDistributionEvent,
  IDistributionSectionSettings,
  IExpense,
  IAuditLog,
  IDonation,
  ISiteSettings,
  ISuccessStory,
  IStorySectionSettings,
  ICommitteeMember,
  IHowItWorksStep,
  IFAQItem,
  IFoodDonation,
  IRightHeroCard,
  IVerifiedMetrics
} from '@/lib/types';

interface IQuotaInfo {
  admins: {
    current: number;
    max: number;
    isFull: boolean;
    availableSlots: number;
    members?: Array<{ id: string; name: string; email: string }>;
  };
  volunteers: {
    current: number;
    approvedCount: number;
    max: number;
    isFull: boolean;
    availableSlots: number;
    members?: Array<{ id: string; name: string; status: string }>;
  };
}

type TabType =
  | 'overview'
  | 'campaigns'
  | 'hero-cards'
  | 'announcement-strip'
  | 'verified-metrics'
  | 'how-it-works'
  | 'food-donations'
  | 'distributions'
  | 'expenses'
  | 'committee'
  | 'stories'
  | 'faq'
  | 'volunteers'
  | 'settings'
  | 'qrs'
  | 'audit';


function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Platform Data states
  const [stats, setStats] = useState<any>(null);
  const [quotas, setQuotas] = useState<IQuotaInfo | null>(null);
  const [qrs, setQrs] = useState<IPaymentQR[]>([]);
  const [volunteers, setVolunteers] = useState<IVolunteer[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [stories, setStories] = useState<ISuccessStory[]>([]);
  const [committee, setCommittee] = useState<ICommitteeMember[]>([]);
  const [howItWorksSteps, setHowItWorksSteps] = useState<IHowItWorksStep[]>([]);
  const [faqs, setFaqs] = useState<IFAQItem[]>([]);
  const [foodDonations, setFoodDonations] = useState<IFoodDonation[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [recentDonations, setRecentDonations] = useState<IDonation[]>([]);
  const [distributions, setDistributions] = useState<IDistributionEvent[]>([]);

  // Volunteer filter state
  const [volFilter, setVolFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [volSearch, setVolSearch] = useState('');

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState<ISiteSettings>({
    siteTitle: 'SEVA — Traceable Community Food & Relief Platform',
    tagline: "Your Contribution. Someone's Meal. Someone's Hope.",
    helplinePhone: '+91 1800-SEVA-AID',
    minDonationINR: 20,
    emergencyBannerEnabled: true,
    emergencyBannerBadge: 'Active Relief',
    emergencyBannerText: 'Emergency Flood & Slum Relief Kitchens Active across 12 zones',
    trustTagline: '100% Verified Transparency • Min Donation ₹20',
    bannerTheme: 'orange',
    totalMealsOffset: 125000,
    totalPeopleOffset: 48200,
    activeVolunteersOffset: 840,
    targetDonationGoal: 1050000
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Real-Time Verified Metrics state (strictly defaults to 0 if not entered)
  const [verifiedMetrics, setVerifiedMetrics] = useState<IVerifiedMetrics>({
    totalMealsServed: 0,
    totalPeopleHelped: 0,
    activeVolunteersCount: 0,
    totalDistributionsCount: 0,
    totalDonated: 0,
    badgeText: 'REAL-TIME VERIFIED METRICS',
    heading: 'Every Rupee Accounted For, Every Meal Counted',
    subheading: 'Data verified directly through ground distribution logs and administrator-reviewed photographic proof.',
    mealsLabel: 'Wholesome Meals Served',
    mealsSublabel: 'Cooked fresh & safely distributed',
    peopleLabel: 'Verified People Helped',
    peopleSublabel: 'Unique individuals & families',
    volunteersLabel: 'Active Ground Volunteers',
    volunteersSublabel: 'Verified ID badge holders',
    distributionsLabel: 'Distribution Events',
    distributionsSublabel: 'Disaster camps & slum visits',
    donatedLabel: '100% Traceable Aid',
    donatedSublabel: 'Starting from ₹20 minimum'
  });
  const [savingVerifiedMetrics, setSavingVerifiedMetrics] = useState(false);
  const [metricsCustomCopyOpen, setMetricsCustomCopyOpen] = useState(false);

  // Support an Active Campaign Section Settings state
  const [campaignSectionSettings, setCampaignSectionSettings] = useState<ICampaignSectionSettings>({
    isEnabled: true,
    badgeText: 'Active Relief Missions',
    heading: 'Support an Active Campaign',
    subheading: '100% of your funds go directly into verified grocery procurement, kitchen prep, and volunteer field dispatches.',
    minDonationText: 'Minimum Donation: ₹20 INR'
  });
  const [savingCampaignSectionSettings, setSavingCampaignSectionSettings] = useState(false);
  const [campaignSettingsDrawerOpen, setCampaignSettingsDrawerOpen] = useState(false);

  // Recent Ground Distributions Section Settings state
  const [distributionSectionSettings, setDistributionSectionSettings] = useState<IDistributionSectionSettings>({
    isEnabled: true,
    badgeText: 'Field Evidence & Verification',
    heading: 'Recent Ground Distributions',
    subheading: 'Photographs, beneficiary headcounts, and field volunteer logs uploaded directly after every meal distribution.',
    verifiedBadgeText: 'Admin Reviewed & Approved'
  });
  const [savingDistSettings, setSavingDistSettings] = useState(false);
  const [distSettingsDrawerOpen, setDistSettingsDrawerOpen] = useState(false);

  // Success Stories / Blogs Section Settings state
  const [storySectionSettings, setStorySectionSettings] = useState<IStorySectionSettings>({
    isEnabled: true,
    badgeText: 'Human Impact',
    heading: 'Stories of Hope, Dignity & Survival',
    subheading: 'Behind every ₹20 or ₹500 donated is a living human being whose day was made brighter with food, compassion, and community respect.',
    consentBadgeText: 'Beneficiary Consent Verified'
  });
  const [savingStorySettings, setSavingStorySettings] = useState(false);
  const [storySettingsDrawerOpen, setStorySettingsDrawerOpen] = useState(false);

  // Modal States
  // 1. Campaign Modal
  const [showCampModal, setShowCampModal] = useState(false);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campTarget, setCampTarget] = useState(100000);
  const [campCover, setCampCover] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop');
  const [campLocation, setCampLocation] = useState('Central District');
  const [campEmergency, setCampEmergency] = useState(false);
  const [campCategory, setCampCategory] = useState<ICampaign['category']>('Food Relief');
  const [campStatus, setCampStatus] = useState<ICampaign['status']>('Active');

  // Ground Distribution Modal
  const [showDistModal, setShowDistModal] = useState(false);
  const [editingDistId, setEditingDistId] = useState<string | null>(null);
  const [distCampaignTitle, setDistCampaignTitle] = useState('');
  const [distLocation, setDistLocation] = useState('');
  const [distDate, setDistDate] = useState(new Date().toISOString().split('T')[0]);
  const [distVolunteers, setDistVolunteers] = useState('Amitabh Roy, Sneha Banerjee');
  const [distMealsDistributed, setDistMealsDistributed] = useState(350);
  const [distBeneficiariesCount, setDistBeneficiariesCount] = useState(120);
  const [distFoodSource, setDistFoodSource] = useState('Central Seva Relief Kitchen & Partner Bakery');
  const [distProofPhoto, setDistProofPhoto] = useState('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop');
  const [distStatus, setDistStatus] = useState<IDistributionEvent['status']>('Verified');
  const [distNotes, setDistNotes] = useState('');

  // 2. How It Works Modal
  const [showHIWModal, setShowHIWModal] = useState(false);
  const [editingHIWId, setEditingHIWId] = useState<string | null>(null);
  const [hiwNumber, setHiwNumber] = useState('01');
  const [hiwTitle, setHiwTitle] = useState('');
  const [hiwDesc, setHiwDesc] = useState('');

  // 3. Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expAmount, setExpAmount] = useState(5000);
  const [expCategory, setExpCategory] = useState<IExpense['category']>('Food Purchases');
  const [expDesc, setExpDesc] = useState('');
  const [expCamp, setExpCamp] = useState('Emergency Flood Relief Kitchen 2026');

  // 4. Committee Modal
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [editingCommitteeId, setEditingCommitteeId] = useState<string | null>(null);
  const [commName, setCommName] = useState('');
  const [commDesignation, setCommDesignation] = useState('');
  const [commBio, setCommBio] = useState('');
  const [commResponsibilities, setCommResponsibilities] = useState('');
  const [commPhoto, setCommPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop');

  // 5. Story Modal
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyBeneficiary, setStoryBeneficiary] = useState('');
  const [storyLocation, setStoryLocation] = useState('');
  const [storySummary, setStorySummary] = useState('');
  const [storyImpact, setStoryImpact] = useState('');
  const [storyImage, setStoryImage] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop');

  // 6. FAQ Modal
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingFAQId, setEditingFAQId] = useState<string | null>(null);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  // 7. Right Hero Visual Cards State
  const [heroCard, setHeroCard] = useState<IRightHeroCard | null>(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroBadgeText, setHeroBadgeText] = useState('Live Field Dispatch');
  const [heroTimeAgo, setHeroTimeAgo] = useState('12 mins ago');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroRaisedAmount, setHeroRaisedAmount] = useState(184500);
  const [heroGoalAmount, setHeroGoalAmount] = useState(250000);
  const [heroProgress, setHeroProgress] = useState(74);
  const [heroAutoCalcProgress, setHeroAutoCalcProgress] = useState(true);
  const [heroShowImpact, setHeroShowImpact] = useState(true);
  const [heroImpactTag, setHeroImpactTag] = useState('Direct Impact');
  const [heroImpactText, setHeroImpactText] = useState('₹20 = 1 Nourishing Meal');
  const [heroImpactIcon, setHeroImpactIcon] = useState('✓');
  const [heroShowVolunteers, setHeroShowVolunteers] = useState(true);
  const [heroVolunteersTag, setHeroVolunteersTag] = useState('Volunteers');
  const [heroVolunteersText, setHeroVolunteersText] = useState('840+ Active on Field');
  const [heroVolunteersIcon, setHeroVolunteersIcon] = useState('★');
  const [heroIsActive, setHeroIsActive] = useState(true);
  const [savingHeroCard, setSavingHeroCard] = useState(false);

  // Initialize active tab from query parameter if present
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && [
      'overview', 'campaigns', 'hero-cards', 'announcement-strip', 'verified-metrics',
      'how-it-works', 'food-donations', 'distributions',
      'expenses', 'committee', 'stories', 'faq', 'volunteers',
      'settings', 'qrs', 'audit'
    ].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Master Data Fetcher
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        dashRes,
        quotasRes,
        qrsRes,
        volsRes,
        campsRes,
        expRes,
        storiesRes,
        committeeRes,
        hiwRes,
        faqRes,
        foodRes,
        auditRes,
        settingsRes,
        heroCardRes,
        metricsRes,
        campSettingsRes,
        distRes,
        distSettingsRes,
        storySettingsRes
      ] = await Promise.all([
        fetch('/api/admin/dashboard').then(r => r.json()).catch(() => ({})),
        fetch('/api/auth/quotas').then(r => r.json()).catch(() => ({})),
        fetch('/api/payment-qr?all=true').then(r => r.json()).catch(() => ({})),
        fetch('/api/volunteers').then(r => r.json()).catch(() => ({})),
        fetch('/api/campaigns').then(r => r.json()).catch(() => ({})),
        fetch('/api/expenses').then(r => r.json()).catch(() => ({})),
        fetch('/api/stories').then(r => r.json()).catch(() => ({})),
        fetch('/api/committee').then(r => r.json()).catch(() => ({})),
        fetch('/api/how-it-works').then(r => r.json()).catch(() => ({})),
        fetch('/api/faq').then(r => r.json()).catch(() => ({})),
        fetch('/api/food-donations').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/audit-logs').then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/settings').then(r => r.json()).catch(() => ({})),
        fetch('/api/hero-cards').then(r => r.json()).catch(() => ({})),
        fetch('/api/verified-metrics').then(r => r.json()).catch(() => ({})),
        fetch('/api/campaigns/section-settings').then(r => r.json()).catch(() => ({})),
        fetch('/api/distributions').then(r => r.json()).catch(() => ({})),
        fetch('/api/distributions/section-settings').then(r => r.json()).catch(() => ({})),
        fetch('/api/stories/section-settings').then(r => r.json()).catch(() => ({}))
      ]);

      if (dashRes.success) {
        setStats(dashRes.data.stats);
        setRecentDonations(dashRes.data.recentDonations || []);
      }
      if (quotasRes.success) setQuotas(quotasRes.quotas);
      if (qrsRes.success) setQrs(qrsRes.data || []);
      if (volsRes.success) setVolunteers(volsRes.data || []);
      if (campsRes.success) setCampaigns(campsRes.data || []);
      if (expRes.success) setExpenses(expRes.data || []);
      if (storiesRes.success) setStories(storiesRes.data || []);
      if (committeeRes.success) setCommittee(committeeRes.data || []);
      if (hiwRes.success) setHowItWorksSteps(hiwRes.data || []);
      if (faqRes.success) setFaqs(faqRes.data || []);
      if (foodRes.success) setFoodDonations(foodRes.data || []);
      if (auditRes.success) setAuditLogs(auditRes.data || []);
      if (settingsRes.success && settingsRes.data) setSiteSettings(settingsRes.data);
      if (metricsRes.success && metricsRes.data) setVerifiedMetrics(metricsRes.data);
      if (campSettingsRes.success && campSettingsRes.data) setCampaignSectionSettings(campSettingsRes.data);
      if (distRes.success) setDistributions(distRes.data || []);
      if (distSettingsRes.success && distSettingsRes.data) setDistributionSectionSettings(distSettingsRes.data);
      if (storySettingsRes.success && storySettingsRes.data) setStorySectionSettings(storySettingsRes.data);
      if (heroCardRes.success && heroCardRes.data) {
        const c = heroCardRes.data;
        setHeroCard(c);
        setHeroTitle(c.title || '');
        setHeroBadgeText(c.badgeText || 'Live Field Dispatch');
        setHeroTimeAgo(c.timeAgo || '12 mins ago');
        setHeroImageUrl(c.imageUrl || '');
        setHeroRaisedAmount(c.raisedAmount || 0);
        setHeroGoalAmount(c.goalAmount || 0);
        setHeroProgress(c.progressPercentage || 0);
        setHeroShowImpact(c.showImpactCard !== false);
        setHeroImpactTag(c.impactCardTag || 'Direct Impact');
        setHeroImpactText(c.impactCardText || '₹20 = 1 Nourishing Meal');
        setHeroImpactIcon(c.impactCardIcon || '✓');
        setHeroShowVolunteers(c.showVolunteerCard !== false);
        setHeroVolunteersTag(c.volunteerCardTag || 'Volunteers');
        setHeroVolunteersText(c.volunteerCardText || '840+ Active on Field');
        setHeroVolunteersIcon(c.volunteerCardIcon || '★');
        setHeroIsActive(c.isActive !== false);
      } else {
        setHeroCard(null);
      }

    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notify = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // --- ACTIONS ---

  // 1. Volunteer Actions
  const handleVolunteerAction = async (volunteerId: string, status: IVolunteer['status']) => {
    try {
      const res = await fetch('/api/volunteers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId, status, reviewer: user?.name || 'Admin Lead' })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Volunteer status updated to ${status}.`);
        fetchData();
      } else {
        alert(data.error || 'Failed to update volunteer status.');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating volunteer');
    }
  };

  const handleDeleteVolunteer = async (volunteerId: string) => {
    if (!confirm('Are you sure you want to remove this volunteer from the team?')) return;
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Volunteer removed from platform.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. QR Code Actions
  const handleQRAction = async (qrId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/payment-qr', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrId, action, reviewer: user?.name || 'Admin Lead' })
      });
      const data = await res.json();
      if (data.success) {
        notify(`QR Code successfully ${action}d.`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Campaign CRUD
  const openNewCampaignModal = () => {
    setEditingCampId(null);
    setCampTitle('');
    setCampDesc('');
    setCampTarget(100000);
    setCampCover('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop');
    setCampLocation('Central District');
    setCampEmergency(false);
    setCampCategory('Food Relief');
    setCampStatus('Active');
    setShowCampModal(true);
  };

  const openEditCampaignModal = (c: ICampaign) => {
    setEditingCampId(c.id || (c as any)._id);
    setCampTitle(c.title);
    setCampDesc(c.description);
    setCampTarget(c.targetAmount);
    setCampCover(c.coverImage);
    setCampLocation(c.location);
    setCampEmergency(Boolean(c.isEmergency));
    setCampCategory(c.category);
    setCampStatus(c.status);
    setShowCampModal(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCampId ? `/api/campaigns/${editingCampId}` : '/api/campaigns';
      const method = editingCampId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campTitle,
          description: campDesc,
          targetAmount: campTarget,
          coverImage: campCover,
          location: campLocation,
          isEmergency: campEmergency,
          category: campCategory,
          status: campStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        notify(editingCampId ? 'Campaign updated in database.' : 'New campaign launched live.');
        setShowCampModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Campaign deleted.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCampaignSectionEnabled = async (enabled: boolean) => {
    const updated = { ...campaignSectionSettings, isEnabled: enabled };
    setCampaignSectionSettings(updated);
    try {
      const res = await fetch('/api/campaigns/section-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        notify(enabled
          ? 'Support an Active Campaign section enabled on main website.'
          : 'Support an Active Campaign section disabled — div completely removed from main website.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCampaignSectionSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingCampaignSectionSettings(true);
    try {
      const res = await fetch('/api/campaigns/section-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignSectionSettings)
      });
      const data = await res.json();
      if (data.success) {
        notify('Campaign section copy & settings saved successfully.');
        setCampaignSettingsDrawerOpen(false);
      } else {
        alert(data.error || 'Failed to save campaign section settings');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCampaignSectionSettings(false);
    }
  };

  const handleClearAllCampaigns = async () => {
    if (!confirm('Are you sure you want to CLEAR ALL CAMPAIGNS? This will remove all campaigns from the database, and the "Support an Active Campaign" div will be completely removed from the main website.')) return;
    try {
      const res = await fetch('/api/campaigns/clear-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('All campaigns cleared. The "Support an Active Campaign" div is now completely removed from the main website.');
        fetchData();
      } else {
        alert(data.error || 'Failed to clear campaigns');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSampleCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns/load-sample', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('Default sample campaigns restored! Section is now visible on the main website.');
        fetchData();
      } else {
        alert(data.error || 'Failed to restore default sample campaigns');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCampaignStatus = async (camp: ICampaign) => {
    const newStatus: ICampaign['status'] = camp.status === 'Active' ? 'Paused' : 'Active';
    const cId = camp.id || (camp as any)._id;
    try {
      const res = await fetch(`/api/campaigns/${cId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Campaign "${camp.title}" status changed to ${newStatus}.`);
        fetchData();
      } else {
        alert(data.error || 'Failed to update campaign status');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ground Distributions Actions
  const openNewDistributionModal = () => {
    setEditingDistId(null);
    setDistCampaignTitle('');
    setDistLocation('');
    setDistDate(new Date().toISOString().split('T')[0]);
    setDistVolunteers('');
    setDistMealsDistributed(250);
    setDistBeneficiariesCount(100);
    setDistFoodSource('');
    setDistProofPhoto('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop');
    setDistStatus('Verified');
    setDistNotes('');
    setShowDistModal(true);
  };

  const openEditDistributionModal = (d: IDistributionEvent) => {
    setEditingDistId(d.id || (d as any)._id);
    setDistCampaignTitle(d.campaignTitle);
    setDistLocation(d.location);
    const volList = d.volunteersInvolved || d.volunteersAssigned || [];
    setDistVolunteers(Array.isArray(volList) ? volList.join(', ') : (volList || ''));
    setDistMealsDistributed(d.mealsDistributed);
    setDistBeneficiariesCount(d.beneficiariesCount);
    setDistFoodSource(d.foodSource || '');
    setDistProofPhoto(d.proofPhoto || (d.proofPhotos && d.proofPhotos[0]) || '');
    setDistStatus(d.status);
    setDistNotes(d.notes || '');
    setShowDistModal(true);
  };

  const handleSaveDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const volArray = distVolunteers.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        campaignTitle: distCampaignTitle,
        location: distLocation,
        date: distDate,
        volunteersInvolved: volArray,
        mealsDistributed: Number(distMealsDistributed) || 0,
        beneficiariesCount: Number(distBeneficiariesCount) || 0,
        foodSource: distFoodSource,
        proofPhoto: distProofPhoto,
        status: distStatus,
        notes: distNotes
      };

      const url = editingDistId ? `/api/distributions/${editingDistId}` : '/api/distributions';
      const method = editingDistId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        notify(editingDistId ? 'Distribution record updated.' : 'New distribution mission logged.');
        setShowDistModal(false);
        fetchData();
      } else {
        alert(data.error || 'Failed to save distribution');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDistribution = async (id: string) => {
    if (!confirm('Are you sure you want to delete this distribution record?')) return;
    try {
      const res = await fetch(`/api/distributions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Distribution event deleted.');
        fetchData();
      } else {
        alert(data.error || 'Failed to delete distribution');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDistributionSectionEnabled = async (enabled: boolean) => {
    const updated = { ...distributionSectionSettings, isEnabled: enabled };
    setDistributionSectionSettings(updated);
    try {
      const res = await fetch('/api/distributions/section-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        notify(enabled
          ? 'Recent Ground Distributions section enabled on main website.'
          : 'Recent Ground Distributions section disabled — div completely removed from main website.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDistributionSectionSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingDistSettings(true);
    try {
      const res = await fetch('/api/distributions/section-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(distributionSectionSettings)
      });
      const data = await res.json();
      if (data.success) {
        notify('Distribution section copy & settings saved successfully.');
        setDistSettingsDrawerOpen(false);
      } else {
        alert(data.error || 'Failed to save distribution section settings');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDistSettings(false);
    }
  };

  const handleClearAllDistributions = async () => {
    if (!confirm('Are you sure you want to CLEAR ALL GROUND DISTRIBUTIONS? This will empty all distribution events from the database, and the "Recent Ground Distributions" div will be completely removed from the main website.')) return;
    try {
      const res = await fetch('/api/distributions/clear-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('All ground distributions cleared. The "Recent Ground Distributions" div is now completely removed from the main website.');
        fetchData();
      } else {
        alert(data.error || 'Failed to clear distributions');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSampleDistributions = async () => {
    try {
      const res = await fetch('/api/distributions/load-sample', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('Default verified sample distributions restored! Section is now visible on the main website.');
        fetchData();
      } else {
        alert(data.error || 'Failed to restore default sample distributions');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. How It Works CRUD
  const openNewHIWModal = () => {
    setEditingHIWId(null);
    setHiwNumber(`0${howItWorksSteps.length + 1}`);
    setHiwTitle('');
    setHiwDesc('');
    setShowHIWModal(true);
  };

  const openEditHIWModal = (step: IHowItWorksStep) => {
    setEditingHIWId(step.id);
    setHiwNumber(step.number);
    setHiwTitle(step.title);
    setHiwDesc(step.desc);
    setShowHIWModal(true);
  };

  const handleSaveHIW = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingHIWId ? `/api/how-it-works/${editingHIWId}` : '/api/how-it-works';
      const method = editingHIWId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: hiwNumber,
          title: hiwTitle,
          desc: hiwDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        notify(editingHIWId ? 'How It Works step updated.' : 'New workflow step added.');
        setShowHIWModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHIW = async (id: string) => {
    if (!confirm('Delete this workflow step from public site?')) return;
    try {
      const res = await fetch(`/api/how-it-works/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Workflow step removed.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Food Rescue Dispatch
  const handleFoodDonationStatus = async (id: string, status: IFoodDonation['status']) => {
    try {
      const res = await fetch(`/api/food-donations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: `Updated by ${user?.name || 'Admin'} at ${new Date().toLocaleTimeString()}` })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Food donation pickup status marked as: ${status}`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Expense CRUD
  const openNewExpenseModal = () => {
    setEditingExpenseId(null);
    setExpAmount(5000);
    setExpCategory('Food Purchases');
    setExpDesc('');
    setExpCamp('Emergency Flood Relief Kitchen 2026');
    setShowExpenseModal(true);
  };

  const openEditExpenseModal = (exp: IExpense) => {
    setEditingExpenseId(exp.id || (exp as any)._id);
    setExpAmount(exp.amount);
    setExpCategory(exp.category);
    setExpDesc(exp.description);
    setExpCamp(exp.campaignTitle);
    setShowExpenseModal(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExpenseId ? `/api/expenses/${editingExpenseId}` : '/api/expenses';
      const method = editingExpenseId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: expAmount,
          category: expCategory,
          campaignTitle: expCamp,
          description: expDesc,
          approvedBy: user?.name || 'Managing Trustee'
        })
      });
      const data = await res.json();
      if (data.success) {
        notify(editingExpenseId ? 'Expense entry updated in public ledger.' : 'Expense logged to transparency ledger.');
        setShowExpenseModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Expense record removed.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Committee CRUD
  const openNewCommitteeModal = () => {
    setEditingCommitteeId(null);
    setCommName('');
    setCommDesignation('');
    setCommBio('');
    setCommResponsibilities('');
    setCommPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop');
    setShowCommitteeModal(true);
  };

  const openEditCommitteeModal = (m: ICommitteeMember) => {
    setEditingCommitteeId(m.id);
    setCommName(m.name);
    setCommDesignation(m.designation);
    setCommBio(m.bio);
    setCommResponsibilities(m.responsibilities);
    setCommPhoto(m.photo);
    setShowCommitteeModal(true);
  };

  const handleSaveCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCommitteeId ? `/api/committee/${editingCommitteeId}` : '/api/committee';
      const method = editingCommitteeId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: commName,
          designation: commDesignation,
          bio: commBio,
          responsibilities: commResponsibilities,
          photo: commPhoto
        })
      });
      const data = await res.json();
      if (data.success) {
        notify(editingCommitteeId ? 'Committee member updated.' : 'New committee member added.');
        setShowCommitteeModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCommittee = async (id: string) => {
    if (!confirm('Are you sure you want to remove this committee member?')) return;
    try {
      const res = await fetch(`/api/committee/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Committee member removed.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Story CRUD
  const openNewStoryModal = () => {
    setEditingStoryId(null);
    setStoryTitle('');
    setStoryBeneficiary('');
    setStoryLocation('Central District');
    setStorySummary('');
    setStoryImpact('');
    setStoryImage('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop');
    setShowStoryModal(true);
  };

  const openEditStoryModal = (story: ISuccessStory) => {
    setEditingStoryId(story.id);
    setStoryTitle(story.title);
    setStoryBeneficiary(story.beneficiaryName);
    setStoryLocation(story.location);
    setStorySummary(story.summary);
    setStoryImpact(story.impactText);
    setStoryImage(story.image);
    setShowStoryModal(true);
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStoryId ? `/api/stories/${editingStoryId}` : '/api/stories';
      const method = editingStoryId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: storyTitle,
          beneficiaryName: storyBeneficiary,
          location: storyLocation,
          summary: storySummary,
          impactText: storyImpact,
          image: storyImage
        })
      });
      const data = await res.json();
      if (data.success) {
        notify(editingStoryId ? 'Story updated successfully.' : 'Story published to public site.');
        setShowStoryModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Story removed.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStorySectionEnabled = async (enabled: boolean) => {
    const updated = { ...storySectionSettings, isEnabled: enabled };
    setStorySectionSettings(updated);
    try {
      const res = await fetch('/api/stories/section-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        notify(enabled
          ? 'Stories of Hope section enabled on main website.'
          : 'Stories of Hope section disabled — div completely removed from main website.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveStorySectionSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingStorySettings(true);
    try {
      const res = await fetch('/api/stories/section-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storySectionSettings)
      });
      const data = await res.json();
      if (data.success) {
        notify('Stories section copy & settings saved successfully.');
        setStorySettingsDrawerOpen(false);
      } else {
        alert(data.error || 'Failed to save stories section settings');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStorySettings(false);
    }
  };

  const handleClearAllStories = async () => {
    if (!confirm('Are you sure you want to CLEAR ALL STORIES? This will empty all stories from the database, and the "Stories of Hope, Dignity & Survival" div will be completely removed from the main website.')) return;
    try {
      const res = await fetch('/api/stories/clear-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('All stories cleared. The Stories section is now completely removed from the main website.');
        fetchData();
      } else {
        alert(data.error || 'Failed to clear stories');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSampleStories = async () => {
    try {
      const res = await fetch('/api/stories/load-sample', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        notify('Default verified sample stories restored! Section is now visible on the main website.');
        fetchData();
      } else {
        alert(data.error || 'Failed to restore default sample stories');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 9. FAQ CRUD
  const openNewFAQModal = () => {
    setEditingFAQId(null);
    setFaqQ('');
    setFaqA('');
    setShowFAQModal(true);
  };

  const openEditFAQModal = (f: IFAQItem) => {
    setEditingFAQId(f.id);
    setFaqQ(f.q);
    setFaqA(f.a);
    setShowFAQModal(true);
  };

  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFAQId ? `/api/faq/${editingFAQId}` : '/api/faq';
      const method = editingFAQId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: faqQ, a: faqA })
      });
      const data = await res.json();
      if (data.success) {
        notify(editingFAQId ? 'FAQ updated in database.' : 'FAQ added to public page.');
        setShowFAQModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('FAQ item removed.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 10. Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...siteSettings, reviewer: user?.name || user?.email || 'System Admin' })
      });
      const data = await res.json();
      if (data.success) {
        notify('Website settings and impact metrics synchronized to MongoDB.');
        setSiteSettings(data.data);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  // Real-Time Verified Metrics Handlers
  const handleSaveVerifiedMetrics = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingVerifiedMetrics(true);
    try {
      const parseVal = (v: any) => {
        if (v === '' || v === null || v === undefined || isNaN(Number(v))) return 0;
        const num = Number(v);
        return num < 0 ? 0 : num;
      };

      const payload = {
        totalMealsServed: parseVal(verifiedMetrics.totalMealsServed),
        totalPeopleHelped: parseVal(verifiedMetrics.totalPeopleHelped),
        activeVolunteersCount: parseVal(verifiedMetrics.activeVolunteersCount),
        totalDistributionsCount: parseVal(verifiedMetrics.totalDistributionsCount),
        totalDonated: parseVal(verifiedMetrics.totalDonated),
        badgeText: verifiedMetrics.badgeText,
        heading: verifiedMetrics.heading,
        subheading: verifiedMetrics.subheading,
        mealsLabel: verifiedMetrics.mealsLabel,
        mealsSublabel: verifiedMetrics.mealsSublabel,
        peopleLabel: verifiedMetrics.peopleLabel,
        peopleSublabel: verifiedMetrics.peopleSublabel,
        volunteersLabel: verifiedMetrics.volunteersLabel,
        volunteersSublabel: verifiedMetrics.volunteersSublabel,
        distributionsLabel: verifiedMetrics.distributionsLabel,
        distributionsSublabel: verifiedMetrics.distributionsSublabel,
        donatedLabel: verifiedMetrics.donatedLabel,
        donatedSublabel: verifiedMetrics.donatedSublabel,
        reviewer: user?.name || user?.email || 'System Admin'
      };

      const res = await fetch('/api/verified-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedMetrics(data.data);
        notify('Real-Time Verified Metrics saved and published successfully!');
        fetchData();
      } else {
        alert(data.error || 'Failed to update verified metrics');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error saving verified metrics');
    } finally {
      setSavingVerifiedMetrics(false);
    }
  };

  const handleResetVerifiedMetrics = async () => {
    if (!confirm('Are you sure you want to reset all Real-Time Verified Metrics to 0? All 5 public metrics will display 0.')) return;
    setSavingVerifiedMetrics(true);
    try {
      const res = await fetch('/api/verified-metrics/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer: user?.name || user?.email || 'System Admin' })
      });
      const data = await res.json();
      if (data.success) {
        setVerifiedMetrics(data.data);
        notify('All Real-Time Verified Metrics have been reset to 0.');
        fetchData();
      } else {
        alert(data.error || 'Failed to reset metrics');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error resetting metrics');
    } finally {
      setSavingVerifiedMetrics(false);
    }
  };

  const handleLoadDemoBaseline = () => {
    setVerifiedMetrics(prev => ({
      ...prev,
      totalMealsServed: 125450,
      totalPeopleHelped: 48205,
      activeVolunteersCount: 840,
      totalDistributionsCount: 313,
      totalDonated: 0
    }));
    notify('Loaded demo verified baseline figures into inputs. Click "Save Verified Metrics" to publish.');
  };

  // 11. Right Hero Visual Cards Handlers
  const handleSaveHeroCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroTitle.trim()) {
      alert('Please provide a title for the Right Hero Visual Cards.');
      return;
    }

    setSavingHeroCard(true);
    try {
      const calculatedProgress = heroAutoCalcProgress && heroGoalAmount > 0
        ? Math.min(100, Math.round((heroRaisedAmount / heroGoalAmount) * 100))
        : heroProgress;

      const res = await fetch('/api/hero-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: heroTitle.trim(),
          badgeText: heroBadgeText.trim() || 'Live Field Dispatch',
          timeAgo: heroTimeAgo.trim() || '12 mins ago',
          imageUrl: heroImageUrl.trim(),
          raisedAmount: Number(heroRaisedAmount) || 0,
          goalAmount: Number(heroGoalAmount) || 0,
          progressPercentage: Number(calculatedProgress) || 0,
          impactCardTag: heroImpactTag.trim() || 'Direct Impact',
          impactCardText: heroImpactText.trim() || '₹20 = 1 Nourishing Meal',
          impactCardIcon: heroImpactIcon.trim() || '✓',
          showImpactCard: heroShowImpact,
          volunteerCardTag: heroVolunteersTag.trim() || 'Volunteers',
          volunteerCardText: heroVolunteersText.trim() || '840+ Active on Field',
          volunteerCardIcon: heroVolunteersIcon.trim() || '★',
          showVolunteerCard: heroShowVolunteers,
          isActive: heroIsActive,
          reviewer: user?.name || user?.email || 'System Admin'
        })
      });

      const data = await res.json();
      if (data.success) {
        notify('Right Hero Visual Cards published successfully to MongoDB Atlas.');
        setHeroCard(data.data);
        fetchData();
      } else {
        alert(data.error || 'Failed to save Right Hero Visual Cards');
      }
    } catch (e: any) {
      console.error(e);
      alert('Network error saving Right Hero Visual Cards: ' + e.message);
    } finally {
      setSavingHeroCard(false);
    }
  };

  const handleClearHeroCard = async () => {
    if (!confirm('Are you sure you want to clear/delete the Right Hero Visual Cards? This will immediately remove it from the homepage.')) {
      return;
    }

    try {
      const res = await fetch(`/api/hero-cards?reviewer=${encodeURIComponent(user?.name || user?.email || 'System Admin')}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        notify('Right Hero Visual Cards cleared from database. It is now hidden from the website.');
        setHeroCard(null);
        setHeroTitle('');
        setHeroImageUrl('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSampleHeroCard = () => {
    setHeroTitle('450 Fresh Khichdi Meals Delivered at Lowland Shelter #3');
    setHeroBadgeText('Live Field Dispatch');
    setHeroTimeAgo('12 mins ago');
    setHeroImageUrl('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop');
    setHeroRaisedAmount(184500);
    setHeroGoalAmount(250000);
    setHeroProgress(74);
    setHeroAutoCalcProgress(true);
    setHeroShowImpact(true);
    setHeroImpactTag('Direct Impact');
    setHeroImpactText('₹20 = 1 Nourishing Meal');
    setHeroImpactIcon('✓');
    setHeroShowVolunteers(true);
    setHeroVolunteersTag('Volunteers');
    setHeroVolunteersText('840+ Active on Field');
    setHeroVolunteersIcon('★');
    setHeroIsActive(true);
    notify('Sample template loaded. Click "Save Right Hero Visual Cards" below to publish it live.');
  };


  // Auth Guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center animate-pulse">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-bold text-slate-400">Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Admin Control Center</h2>
            <p className="text-xs text-slate-400 mt-2">
              This area is restricted to authorized trustees and platform administrators. Please sign in with your admin credentials.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/admin&role=admin"
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20"
            >
              <span>Sign In to Admin Hub with OTP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 inline-block">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-rose-900/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Unauthorized Access</h2>
            <p className="text-xs text-slate-400 mt-2">
              You are logged in as <strong className="text-white">{user.name}</strong> with role <span className="text-orange-400 font-bold uppercase">{user.role}</span>. You do not have administrator permissions to access this control room.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {user.role === 'volunteer' && (
              <Link
                href="/volunteer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                Go to Volunteer Operations Hub
              </Link>
            )}
            {user.role === 'donor' && (
              <Link
                href="/donor"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                Go to Donor Impact Portal
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingQRs = qrs.filter(q => q.status === 'Pending');
  const pendingVols = volunteers.filter(v => v.status === 'Pending');
  const pendingFood = foodDonations.filter(f => f.status === 'Pending');

  const filteredVolunteers = volunteers.filter(vol => {
    if (volFilter === 'pending') return vol.status === 'Pending';
    if (volFilter === 'approved') return vol.status === 'Approved';
    return true;
  }).filter(vol => {
    if (!volSearch) return true;
    const q = volSearch.toLowerCase();
    return vol.name.toLowerCase().includes(q) || vol.volunteerId.toLowerCase().includes(q) || vol.area.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Public Website</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                S
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wide text-white">SEVA GOVERNANCE DESK</h1>
                <p className="text-[10px] text-slate-400">7-Section Control • Strict Role Quotas (2 Admins / 4 Volunteers)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Quota Badges */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono">
              <span className={`px-2.5 py-1 rounded-full border ${
                quotas?.admins.isFull ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-slate-800 border-slate-700 text-orange-400'
              }`}>
                Admins: {quotas ? `${quotas.admins.current}/${quotas.admins.max}` : '1/2'}
              </span>
              <span className={`px-2.5 py-1 rounded-full border ${
                quotas?.volunteers.isFull ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}>
                Volunteers: {quotas ? `${quotas.volunteers.current}/${quotas.volunteers.max}` : '3/4'}
              </span>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{user.name}</p>
              <span className="text-[10px] text-orange-400 font-mono uppercase">Managing Administrator</span>
            </div>

            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {feedbackMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Tab Navigation (All 7 Sections + Core Desks) */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3 bg-white p-2.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Quotas</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-orange-500" />
            <span>1. Campaigns</span>
            {campaignSectionSettings?.isEnabled && campaigns.filter(c => c.status === 'Active').length > 0 ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                Live ({campaigns.filter(c => c.status === 'Active').length})
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                Div Removed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('hero-cards')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'hero-cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Right Hero Visual Cards</span>
            {heroCard && heroCard.title && heroCard.isActive !== false ? (
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                Live
              </span>
            ) : (
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                Hidden
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('announcement-strip')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'announcement-strip' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span>Top Announcement Strip</span>
            {siteSettings?.emergencyBannerEnabled !== false ? (
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                Live
              </span>
            ) : (
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                Hidden
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('verified-metrics')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'verified-metrics' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            <span>Verified Metrics</span>
            <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-full">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'how-it-works' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>2. How It Works</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">{howItWorksSteps.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('food-donations')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'food-donations' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-500" />
            <span>3. Food Rescue</span>
            {pendingFood.length > 0 && (
              <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 rounded-full animate-pulse">
                {pendingFood.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('distributions')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'distributions' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-500" />
            <span>Ground Distributions</span>
            {distributionSectionSettings?.isEnabled !== false && distributions.filter(d => d.status !== 'Draft').length > 0 ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                Live ({distributions.filter(d => d.status !== 'Draft').length})
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                Div Removed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'expenses' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
            <span>4. Transparency</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">{expenses.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('committee')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'committee' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>5. Committee</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">{committee.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stories' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-500" />
            <span>6. Stories / Blogs</span>
            {storySectionSettings?.isEnabled !== false && stories.length > 0 ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                Live ({stories.length})
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                Div Removed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'faq' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
            <span>7. FAQ</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1 rounded">{faqs.length}</span>
          </button>

          <div className="h-5 w-px bg-slate-300 mx-1 hidden lg:block" />

          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'volunteers' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Volunteer Desk</span>
            {pendingVols.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                {pendingVols.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('qrs')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'qrs' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QRs</span>
            {pendingQRs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {pendingQRs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 0: OVERVIEW & STRICT QUOTAS METER */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Strict Quotas Capacity Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-orange-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Strict Platform Governance Quota Monitor
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">Platform Role Capacity & Limits</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hardcoded ceiling: Maximum <strong>2 Administrators</strong> and <strong>4 Field Volunteers</strong>. Registrations and approvals beyond these thresholds are strictly blocked by the system.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Atlas: cluster0.7q4i6rp.mongodb.net</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mt-5">
                {/* Admin Capacity */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">Administrator Seats</span>
                    <span className="text-lg font-black font-mono text-orange-400">
                      {quotas ? quotas.admins.current : 1} / {quotas ? quotas.admins.max : 2}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${quotas?.admins.isFull ? 'bg-rose-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(100, ((quotas ? quotas.admins.current : 1) / (quotas ? quotas.admins.max : 2)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{quotas?.admins.isFull ? 'Quota Exhausted' : `${quotas ? quotas.admins.availableSlots : 1} seat open`}</span>
                    <span className="text-orange-300 font-semibold">Max 2 Policy</span>
                  </div>
                </div>

                {/* Volunteer Capacity */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">Volunteer Force Capacity</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {quotas ? quotas.volunteers.current : 3} / {quotas ? quotas.volunteers.max : 4}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${quotas?.volunteers.isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ((quotas ? quotas.volunteers.current : 3) / (quotas ? quotas.volunteers.max : 4)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{quotas ? `${quotas.volunteers.approvedCount} approved` : '2 approved'} ({quotas ? quotas.volunteers.availableSlots : 1} slot open)</span>
                    <span className="text-emerald-300 font-semibold">Max 4 Policy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Donated</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(stats?.totalDonated || 0)}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Audited Public Ledger</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Meals Provided</span>
                <p className="text-2xl font-black text-orange-600 mt-1">{(stats?.totalMealsServed || 0).toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Calibrated with Logistics</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingVols.length + pendingQRs.length}</p>
                <span className="text-[10px] text-slate-500 font-semibold">{pendingVols.length} Vols • {pendingQRs.length} QRs</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{campaigns.filter(c => c.status === 'Active').length}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Emergency Relief Active</span>
              </div>
            </div>

            {/* 7-Section Hub Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">7 Core Modules Managed Directly by Admin</h3>
                <span className="text-xs text-slate-500">Live dynamic rendering • Zero mock items</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-orange-600">1. Campaigns</span>
                    <span className={`text-[10px] font-mono px-1.5 rounded ${campaignSectionSettings?.isEnabled && campaigns.filter(c => c.status === 'Active').length > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                      {campaignSectionSettings?.isEnabled && campaigns.filter(c => c.status === 'Active').length > 0 ? `Live (${campaigns.filter(c => c.status === 'Active').length})` : 'Div Removed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Master visibility, CRUD, sample load</p>
                </button>

                <button
                  onClick={() => setActiveTab('hero-cards')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-amber-600">Hero Visual Cards</span>
                    <span className={`text-[10px] font-mono px-1.5 rounded ${heroCard && heroCard.title && heroCard.isActive !== false ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                      {heroCard && heroCard.title && heroCard.isActive !== false ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Customize right hero cards</p>
                </button>

                <button
                  onClick={() => setActiveTab('verified-metrics')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-orange-600">Verified Metrics</span>
                    <span className="text-[10px] font-mono bg-orange-100 text-orange-800 font-bold px-1.5 rounded">Live</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Meals, people, aid KPIs</p>
                </button>

                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-amber-600">2. How It Works</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{howItWorksSteps.length}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Edit public workflow steps</p>
                </button>

                <button
                  onClick={() => setActiveTab('food-donations')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-600">3. Food Rescue</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{foodDonations.length}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Dispatch surplus pickups</p>
                </button>

                <button
                  onClick={() => setActiveTab('distributions')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600">Ground Distributions</span>
                    <span className={`text-[10px] font-mono px-1.5 rounded ${distributionSectionSettings?.isEnabled !== false && distributions.filter(d => d.status !== 'Draft').length > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                      {distributionSectionSettings?.isEnabled !== false && distributions.filter(d => d.status !== 'Draft').length > 0 ? `Live (${distributions.filter(d => d.status !== 'Draft').length})` : 'Div Removed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Verified photo ground missions</p>
                </button>

                <button
                  onClick={() => setActiveTab('expenses')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-cyan-600">4. Transparency</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{expenses.length}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Publish mandi invoices</p>
                </button>

                <button
                  onClick={() => setActiveTab('committee')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-600">5. Committee</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{committee.length}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Board trustee directory</p>
                </button>

                <button
                  onClick={() => setActiveTab('stories')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-rose-600">6. Stories / Blogs</span>
                    <span className={`text-[10px] font-mono px-1.5 rounded ${storySectionSettings?.isEnabled !== false && stories.length > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                      {storySectionSettings?.isEnabled !== false && stories.length > 0 ? `Live (${stories.length})` : 'Div Removed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Field impact reports</p>
                </button>

                <button
                  onClick={() => setActiveTab('faq')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-yellow-500 hover:bg-yellow-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-yellow-600">7. FAQ Engine</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{faqs.length}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">₹20 floor & QR governance</p>
                </button>

                <button
                  onClick={() => setActiveTab('volunteers')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-teal-600">Volunteer Vetting</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 rounded">{volunteers.length}/4</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Approve field badges</p>
                </button>
              </div>
            </div>

            {/* Recent Donations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Recent Donations (Verified & Offline Hand Cash)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Donation ID</th>
                      <th className="py-2.5 px-3">Donor</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Collector / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentDonations.map(don => (
                      <tr key={don.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{don.donationId}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{don.donorName}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{formatINR(don.amount)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            don.paymentMethod === 'Cash' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {don.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {don.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">
                          {don.collectedBy ? `Collected by: ${don.collectedBy}` : (don.receiptNote || 'Online Payment')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: CAMPAIGNS (ADMIN CONTROL & ZERO-STATE DIV REMOVAL) */}
        {/* ============================================================ */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Header with status and quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Support an Active Campaign Control</h2>
                    <p className="text-xs text-slate-500">
                      Manage public campaign relief missions. If admin provides nothing or disables the section, this div is completely removed from the main website.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                {/* Live Status indicator */}
                {campaignSectionSettings?.isEnabled && campaigns.filter(c => c.status === 'Active').length > 0 ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live on Website ({campaigns.filter(c => c.status === 'Active').length} Active)</span>
                  </span>
                ) : !campaignSectionSettings?.isEnabled ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Div Removed (Section Disabled by Admin)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Div Removed (0 Active Campaigns)</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleLoadSampleCampaigns}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Load Default Sample Campaigns</span>
                </button>

                {campaigns.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllCampaigns}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Clear All Campaigns</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCampaignSettingsDrawerOpen(!campaignSettingsDrawerOpen)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Section Copy & Texts</span>
                </button>

                <button
                  onClick={openNewCampaignModal}
                  className="py-2 px-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Launch New Campaign</span>
                </button>
              </div>
            </div>

            {/* Section Visibility & Governance Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={campaignSectionSettings?.isEnabled !== false}
                      onChange={(e) => handleToggleCampaignSectionEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Display "Support an Active Campaign" on Main Website
                    </h3>
                    <p className="text-xs text-slate-500">
                      Master toggle: When disabled or when 0 active campaigns exist, the entire section div is completely removed from the DOM.
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  Status: {campaignSectionSettings?.isEnabled !== false ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>

              {/* Status Explanation Callout */}
              {campaignSectionSettings?.isEnabled && campaigns.filter(c => c.status === 'Active').length > 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Live & Visible on Homepage: </span>
                    <span>
                      The section is rendered with {campaigns.filter(c => c.status === 'Active').length} active campaign mission(s). Visitors can view goals, progress, and donate online or via cash.
                    </span>
                  </div>
                </div>
              ) : !campaignSectionSettings?.isEnabled ? (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <Ban className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Section Div Completely Removed: </span>
                    <span>
                      Admin has disabled this section. The &lt;section id=&quot;campaigns&quot;&gt; div returns null and is not rendered anywhere on the main website.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Zero Active Campaigns — Div Completely Removed: </span>
                    <span>
                      Because the admin has not given any active campaigns (empty list or all paused), the entire "Support an Active Campaign" div is removed from the website DOM.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Section Copy Drawer */}
            {campaignSettingsDrawerOpen && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-black text-slate-900">Customize Campaign Section Texts & Headings</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCampaignSettingsDrawerOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveCampaignSectionSettings} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={campaignSectionSettings?.badgeText || ''}
                      onChange={(e) => setCampaignSectionSettings({ ...campaignSectionSettings, badgeText: e.target.value })}
                      placeholder="Active Relief Missions"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={campaignSectionSettings?.heading || ''}
                      onChange={(e) => setCampaignSectionSettings({ ...campaignSectionSettings, heading: e.target.value })}
                      placeholder="Support an Active Campaign"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subheading / Description</label>
                    <textarea
                      rows={2}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={campaignSectionSettings?.subheading || ''}
                      onChange={(e) => setCampaignSectionSettings({ ...campaignSectionSettings, subheading: e.target.value })}
                      placeholder="100% of your funds go directly into verified grocery procurement, kitchen prep, and volunteer field dispatches."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Donation Badge Text</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={campaignSectionSettings?.minDonationText || ''}
                      onChange={(e) => setCampaignSectionSettings({ ...campaignSectionSettings, minDonationText: e.target.value })}
                      placeholder="Minimum Donation: ₹20 INR"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      disabled={savingCampaignSectionSettings}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      {savingCampaignSectionSettings ? 'Saving...' : 'Save Section Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignSettingsDrawerOpen(false)}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Campaign Cards List or Empty Zero State */}
            {campaigns.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/60">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  Zero Campaigns Configured — Div Removed From Main Website
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Because the admin has not given any campaigns, the entire "Support an Active Campaign" div is completely removed from the homepage DOM. Click below to add campaigns or load the default sample missions.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadSampleCampaigns}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Load Default Sample Campaigns</span>
                  </button>
                  <button
                    type="button"
                    onClick={openNewCampaignModal}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Launch New Campaign</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    Showing <strong>{campaigns.length}</strong> total campaigns (
                    <strong className="text-emerald-600">{campaigns.filter(c => c.status === 'Active').length} Active</strong>,{' '}
                    <strong className="text-slate-600">{campaigns.filter(c => c.status !== 'Active').length} Paused</strong>
                    )
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Active campaigns render on public website if section is enabled.
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map(camp => {
                    const cId = camp.id || (camp as any)._id;
                    const pct = camp.targetAmount > 0 ? Math.min(100, Math.round((camp.collectedAmount / camp.targetAmount) * 100)) : 0;
                    return (
                      <div key={cId} className="rounded-2xl border border-slate-200 overflow-hidden bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="relative">
                            <img src={camp.coverImage} alt={camp.title} className="w-full h-44 object-cover" />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                                {camp.category}
                              </span>
                              {camp.isEmergency && (
                                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 px-2 py-1 rounded-md shadow-sm animate-pulse">
                                  Emergency
                                </span>
                              )}
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black shadow-sm ${
                                camp.status === 'Active'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-700 text-slate-100'
                              }`}>
                                {camp.status === 'Active' ? 'Active' : 'Paused'}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{camp.title}</h3>
                            <p className="text-xs text-slate-600 line-clamp-2">{camp.description}</p>
                            
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500">Raised: <strong className="text-emerald-700">{formatINR(camp.collectedAmount)}</strong></span>
                                <span className="text-slate-500">Goal: <strong className="text-slate-800">{formatINR(camp.targetAmount)}</strong></span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-0.5">
                                <span>{pct}% funded</span>
                                <span>{camp.donorCount || 0} donors • {camp.mealsSupported || 0} meals</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[120px]">{camp.location}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Quick Status Toggle button */}
                            <button
                              type="button"
                              onClick={() => handleToggleCampaignStatus(camp)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                                camp.status === 'Active'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={camp.status === 'Active' ? 'Pause Campaign (Hide from site)' : 'Activate Campaign (Show on site)'}
                            >
                              {camp.status === 'Active' ? (
                                <>
                                  <PauseCircle className="w-3.5 h-3.5" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditCampaignModal(camp)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit Campaign Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCampaign(cId)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: RIGHT HERO VISUAL CARDS (ADMIN MANAGEMENT & PREVIEW) */}
        {/* ============================================================ */}
        {activeTab === 'hero-cards' && (
          <div className="space-y-6">
            {/* Header with status and quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Right Hero Visual Cards</h2>
                    <p className="text-xs text-slate-500">
                      Configure the live visual card and floating badges shown on the right side of the homepage hero banner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                {/* Live Status indicator */}
                {heroCard && heroCard.title && heroCard.isActive !== false ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live on Website</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Hidden on Website ({!heroCard || !heroCard.title ? 'Nothing Written' : 'Disabled'})</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleLoadSampleHeroCard}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Fill Default Template</span>
                </button>

                {heroCard && (
                  <button
                    type="button"
                    onClick={handleClearHeroCard}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Clear / Remove Cards</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Form & Live Preview Grid */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Form Column */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSaveHeroCard} className="space-y-6">
                  {/* Notice banner */}
                  <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl text-xs text-orange-950 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Automatic Visibility Logic</p>
                      <p className="text-slate-600 leading-relaxed">
                        If the administrator does not write any card title or clears the content, the Right Hero Visual Cards section is completely omitted from the website, and the homepage hero banner will automatically adjust its layout.
                      </p>
                    </div>
                  </div>

                  {/* 1. Main Visual Card Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-mono">1</span>
                        <span>Main Visual Card Configuration</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Primary featured image, headline, and campaign goal meter.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Card Title / Headline <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                          placeholder="e.g. 450 Fresh Khichdi Meals Delivered at Lowland Shelter #3"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all font-medium text-slate-900"
                          required
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          If this field is empty, the entire Right Hero Visual Cards will be hidden on the site.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Badge Pill Text</label>
                          <input
                            type="text"
                            value={heroBadgeText}
                            onChange={(e) => setHeroBadgeText(e.target.value)}
                            placeholder="e.g. Live Field Dispatch"
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Time / Status Badge</label>
                          <input
                            type="text"
                            value={heroTimeAgo}
                            onChange={(e) => setHeroTimeAgo(e.target.value)}
                            placeholder="e.g. 12 mins ago"
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Card Image URL</label>
                        <input
                          type="url"
                          value={heroImageUrl}
                          onChange={(e) => setHeroImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all font-mono"
                        />
                        {/* Quick Presets */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Presets:</span>
                          <button
                            type="button"
                            onClick={() => setHeroImageUrl('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop')}
                            className="text-[11px] text-orange-600 hover:underline font-medium"
                          >
                            Hot Meal Distribution
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setHeroImageUrl('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop')}
                            className="text-[11px] text-orange-600 hover:underline font-medium"
                          >
                            Community Kitchen
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => setHeroImageUrl('https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=800&auto=format&fit=crop')}
                            className="text-[11px] text-orange-600 hover:underline font-medium"
                          >
                            Packing Ration
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Raised Amount (₹ INR)</label>
                          <input
                            type="number"
                            min="0"
                            value={heroRaisedAmount}
                            onChange={(e) => setHeroRaisedAmount(Number(e.target.value))}
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Goal Target Amount (₹ INR)</label>
                          <input
                            type="number"
                            min="0"
                            value={heroGoalAmount}
                            onChange={(e) => setHeroGoalAmount(Number(e.target.value))}
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all font-mono font-bold text-orange-600"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Progress Bar Meter</label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={heroAutoCalcProgress}
                              onChange={(e) => setHeroAutoCalcProgress(e.target.checked)}
                              className="w-3.5 h-3.5 text-orange-600 rounded"
                            />
                            <span className="text-[11px]">Auto-calculate from Raised & Goal</span>
                          </label>
                        </div>

                        {heroAutoCalcProgress ? (
                          <div className="text-xs text-slate-500 font-mono">
                            Calculated: <strong className="text-slate-800">
                              {heroGoalAmount > 0 ? Math.min(100, Math.round((heroRaisedAmount / heroGoalAmount) * 100)) : 0}%
                            </strong>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={heroProgress}
                              onChange={(e) => setHeroProgress(Number(e.target.value))}
                              className="w-full accent-orange-600"
                            />
                            <span className="text-xs font-mono font-bold text-slate-800 w-12 text-right">
                              {heroProgress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Floating Card 1: Direct Impact Badge */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-mono">2</span>
                        <h3 className="text-sm font-black text-slate-900">Floating Badge 1 (Direct Impact)</h3>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroShowImpact}
                          onChange={(e) => setHeroShowImpact(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Enable Badge</span>
                      </label>
                    </div>

                    {heroShowImpact && (
                      <div className="grid sm:grid-cols-12 gap-3 pt-1">
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Badge Icon</label>
                          <input
                            type="text"
                            value={heroImpactIcon}
                            onChange={(e) => setHeroImpactIcon(e.target.value)}
                            placeholder="✓"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-center font-bold"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tag / Category</label>
                          <input
                            type="text"
                            value={heroImpactTag}
                            onChange={(e) => setHeroImpactTag(e.target.value)}
                            placeholder="Direct Impact"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Text</label>
                          <input
                            type="text"
                            value={heroImpactText}
                            onChange={(e) => setHeroImpactText(e.target.value)}
                            placeholder="₹20 = 1 Nourishing Meal"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Floating Card 2: Volunteers Presence Badge */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[11px] flex items-center justify-center font-mono">3</span>
                        <h3 className="text-sm font-black text-slate-900">Floating Badge 2 (Field Volunteers)</h3>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroShowVolunteers}
                          onChange={(e) => setHeroShowVolunteers(e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span>Enable Badge</span>
                      </label>
                    </div>

                    {heroShowVolunteers && (
                      <div className="grid sm:grid-cols-12 gap-3 pt-1">
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Badge Icon</label>
                          <input
                            type="text"
                            value={heroVolunteersIcon}
                            onChange={(e) => setHeroVolunteersIcon(e.target.value)}
                            placeholder="★"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all text-center font-bold"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tag / Category</label>
                          <input
                            type="text"
                            value={heroVolunteersTag}
                            onChange={(e) => setHeroVolunteersTag(e.target.value)}
                            placeholder="Volunteers"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Text</label>
                          <input
                            type="text"
                            value={heroVolunteersText}
                            onChange={(e) => setHeroVolunteersText(e.target.value)}
                            placeholder="840+ Active on Field"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Master Active Visibility Toggle */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Show Right Hero Visual Cards on Website</p>
                      <p className="text-[11px] text-slate-500">
                        When enabled and card content is written, cards display dynamically in the homepage hero banner.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={heroIsActive}
                        onChange={(e) => setHeroIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingHeroCard}
                      className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {savingHeroCard ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving to MongoDB Atlas...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Save Right Hero Visual Cards</span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/"
                      target="_blank"
                      className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on Live Homepage</span>
                    </Link>
                  </div>
                </form>
              </div>

              {/* Live Real-time Simulation Preview */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black tracking-wide uppercase">Live Simulation Preview</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time Website View</span>
                </div>

                {heroTitle.trim().length === 0 ? (
                  <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-black">
                      ∅
                    </div>
                    <h4 className="text-sm font-black text-amber-950">No Data Written Yet</h4>
                    <p className="text-xs text-amber-800 max-w-xs mx-auto leading-relaxed">
                      Right Hero Visual Cards is currently <strong>hidden</strong> from the website because no title has been written.
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadSampleHeroCard}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      Load Sample Template
                    </button>
                  </div>
                ) : (
                  <div className="relative p-6 rounded-3xl bg-gradient-to-b from-orange-50/60 to-amber-50/40 border border-orange-100 shadow-xl overflow-visible">
                    {!heroIsActive && (
                      <div className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wide shadow-md">
                        Disabled (Hidden)
                      </div>
                    )}

                    <div className="relative mx-auto max-w-sm">
                      {/* Main Image Card Simulation */}
                      <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                        {heroImageUrl ? (
                          <img
                            src={heroImageUrl}
                            alt="Card Preview"
                            className="w-full h-64 object-cover"
                          />
                        ) : (
                          <div className="w-full h-64 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold p-6 text-center text-xs">
                            {heroTitle}
                          </div>
                        )}
                        <div className="p-4 bg-white space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800">
                              {heroBadgeText || 'Live Field Dispatch'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {heroTimeAgo || '12 mins ago'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2">
                            {heroTitle}
                          </h4>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
                              style={{
                                width: `${
                                  heroAutoCalcProgress && heroGoalAmount > 0
                                    ? Math.min(100, Math.round((heroRaisedAmount / heroGoalAmount) * 100))
                                    : heroProgress
                                }%`
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                            <span>Raised: {formatINR(heroRaisedAmount || 0)}</span>
                            <span className="text-orange-600 font-bold">Goal: {formatINR(heroGoalAmount || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Floating verified impact card simulation */}
                      {heroShowImpact && (
                        <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-lg border border-orange-100 max-w-[190px]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                              {heroImpactIcon || '✓'}
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-slate-400">
                                {heroImpactTag || 'Direct Impact'}
                              </p>
                              <p className="text-[11px] font-black text-slate-900">
                                {heroImpactText || '₹20 = 1 Meal'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Floating volunteer card simulation */}
                      {heroShowVolunteers && (
                        <div className="absolute -top-3 -right-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-lg border border-slate-100 max-w-[170px]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px] shrink-0">
                              {heroVolunteersIcon || '★'}
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-bold text-slate-400">
                                {heroVolunteersTag || 'Volunteers'}
                              </p>
                              <p className="text-[11px] font-black text-slate-900">
                                {heroVolunteersText || '840+ Active'}
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
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: TOP EMERGENCY / TRUST ANNOUNCEMENT STRIP */}
        {/* ============================================================ */}
        {activeTab === 'announcement-strip' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Top Emergency / Trust Announcement Strip
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                      Sitewide Header Alert System
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl pt-1">
                  Administer the live crisis alert strip, emergency trust guarantees, helpline telephone, and visual styling displayed across the top banner of every public page.
                </p>
              </div>

              {/* Status pill & Public preview link */}
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
                  siteSettings.emergencyBannerEnabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    siteSettings.emergencyBannerEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  <span>{siteSettings.emergencyBannerEnabled ? 'Live on Public Website' : 'Strip Hidden'}</span>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Site</span>
                </Link>
              </div>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-500" />
                  <span>Live Interactive Preview (Exact Navbar Top)</span>
                </span>
                <span className="text-[11px] text-slate-400">Updates live as you configure fields below</span>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-950/5">
                {/* Mock Browser Header */}
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-3 py-0.5 rounded border border-slate-200">
                      https://seva-platform.org/
                    </span>
                  </div>
                </div>

                {/* Announcement Strip Preview */}
                {siteSettings.emergencyBannerEnabled ? (
                  <div className={`text-white text-xs py-2 px-4 font-medium transition-all ${
                    siteSettings.bannerTheme === 'red'
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
                      : siteSettings.bannerTheme === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
                      : siteSettings.bannerTheme === 'slate'
                      ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950'
                      : siteSettings.bannerTheme === 'amber'
                      ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700'
                      : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700'
                  }`}>
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {siteSettings.emergencyBannerBadge || 'Active Relief'}
                        </span>
                        <span className="font-semibold">{siteSettings.emergencyBannerText || 'Emergency Flood & Slum Relief Kitchens Active across 12 zones'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="hidden sm:inline opacity-95">
                          {siteSettings.trustTagline || `100% Verified Transparency • Min Donation ₹${siteSettings.minDonationINR || 20}`}
                        </span>
                        <span className="text-amber-200 font-mono font-bold">
                          Helpline: {siteSettings.helplinePhone || '+91 1800-SEVA-AID'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 text-slate-400 text-center py-2.5 text-xs italic border-b border-slate-200">
                    Announcement Strip is currently toggled OFF (Hidden from public visitors)
                  </div>
                )}

                {/* Miniature Mock Navbar underneath */}
                <div className="bg-white/95 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                      <img src="/seva-logo.png" alt="SEVA Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-sm text-slate-900">SEVA</span>
                        <span className="text-[9px] bg-orange-100 text-orange-800 font-semibold px-1 rounded">सेवा</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Traceable Community Food & Relief</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span className="hidden sm:inline">Campaigns</span>
                    <span className="hidden sm:inline">How It Works</span>
                    <span className="hidden sm:inline">Food Donation</span>
                    <span className="hidden sm:inline">Transparency</span>
                    <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-sm">Donate Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRESETS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Quick Crisis & Campaign Templates
                </span>
                <span className="text-[11px] text-slate-400">Click any card to pre-fill announcement details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSiteSettings({
                    ...siteSettings,
                    emergencyBannerEnabled: true,
                    emergencyBannerBadge: 'Active Relief',
                    emergencyBannerText: 'Emergency Flood & Slum Relief Kitchens Active across 12 zones',
                    trustTagline: '100% Verified Transparency • Min Donation ₹20',
                    helplinePhone: '+91 1800-SEVA-AID',
                    bannerTheme: 'orange'
                  })}
                  className="p-3.5 text-left rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 transition-all hover:scale-[1.01] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-200/80 px-1.5 py-0.5 rounded">Flood & Slum</span>
                    <span className="text-[10px] text-orange-600 font-bold">Orange Theme</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">Flood & Slum Relief Kitchens</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Active across 12 disaster zones</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSiteSettings({
                    ...siteSettings,
                    emergencyBannerEnabled: true,
                    emergencyBannerBadge: 'Critical SOS',
                    emergencyBannerText: 'URGENT: Cyclone Emergency Food Kits & Clean Water Supply Being Dispatched',
                    trustTagline: '100% Direct Ground Delivery • Digital 80G Certificates',
                    helplinePhone: '+91 98765-SEVA-1',
                    bannerTheme: 'red'
                  })}
                  className="p-3.5 text-left rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 transition-all hover:scale-[1.01] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-200/80 px-1.5 py-0.5 rounded">Crisis Alert</span>
                    <span className="text-[10px] text-rose-600 font-bold">Red Theme</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">Cyclone & Disaster Aid</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Urgent rations & safe water</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSiteSettings({
                    ...siteSettings,
                    emergencyBannerEnabled: true,
                    emergencyBannerBadge: 'Winter SOS',
                    emergencyBannerText: 'Winter Night Shield: Hot Khichdi & Thermal Blankets Across Pavements',
                    trustTagline: 'Audited Transparency Ledger • Min Donation ₹20',
                    helplinePhone: '+91 1800-SEVA-AID',
                    bannerTheme: 'amber'
                  })}
                  className="p-3.5 text-left rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-all hover:scale-[1.01] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded">Winter Relief</span>
                    <span className="text-[10px] text-amber-600 font-bold">Amber Theme</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">Winter Warmth Drive</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Warm meals & thermal blankets</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSiteSettings({
                    ...siteSettings,
                    emergencyBannerEnabled: true,
                    emergencyBannerBadge: 'Community Seva',
                    emergencyBannerText: 'Daily Community Langar & Surplus Food Rescue Operational across 8 centers',
                    trustTagline: 'Zero Waste Food Rescue • FSSAI Certified Hygiene',
                    helplinePhone: '+91 1800-SEVA-AID',
                    bannerTheme: 'emerald'
                  })}
                  className="p-3.5 text-left rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all hover:scale-[1.01] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded">Daily Seva</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Emerald Theme</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">Daily Community Kitchens</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Surplus food rescue & langar</p>
                </button>
              </div>
            </div>

            {/* CONFIGURATION FORM */}
            <form onSubmit={handleSaveSettings} className="space-y-6 pt-2">
              {/* Visibility Switch Card */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Announcement Strip Visibility</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When enabled, the announcement strip appears at the very top of all public pages on desktop and mobile.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={siteSettings.emergencyBannerEnabled}
                    onChange={e => setSiteSettings({ ...siteSettings, emergencyBannerEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-800">
                    {siteSettings.emergencyBannerEnabled ? 'Banner Enabled (Live)' : 'Banner Disabled (Hidden)'}
                  </span>
                </label>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Banner Gradient Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'orange', label: 'Emergency Orange', gradient: 'from-orange-600 to-amber-600' },
                    { id: 'amber', label: 'Golden Amber', gradient: 'from-amber-600 to-yellow-600' },
                    { id: 'red', label: 'Critical Red Alert', gradient: 'from-red-600 to-rose-700' },
                    { id: 'emerald', label: 'Verified Emerald', gradient: 'from-emerald-600 to-teal-700' },
                    { id: 'slate', label: 'Executive Slate', gradient: 'from-slate-900 to-slate-800' }
                  ].map(th => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSiteSettings({ ...siteSettings, bannerTheme: th.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        (siteSettings.bannerTheme || 'orange') === th.id
                          ? 'border-orange-600 ring-2 ring-orange-500/20 bg-orange-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${th.gradient} shadow-sm flex-shrink-0`} />
                      <span className="text-xs font-bold text-slate-800 truncate">{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Inputs Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Badge Label
                  </label>
                  <input
                    type="text"
                    value={siteSettings.emergencyBannerBadge || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, emergencyBannerBadge: e.target.value })}
                    placeholder="e.g. Active Relief, High Alert, Critical SOS"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Highlighted capsule badge shown on the left of the announcement.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Helpline Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={siteSettings.helplinePhone}
                      onChange={e => setSiteSettings({ ...siteSettings, helplinePhone: e.target.value })}
                      placeholder="e.g. +91 1800-SEVA-AID"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Direct public assistance & ground relief dispatch hotline.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Announcement Message
                  </label>
                  <textarea
                    rows={2}
                    value={siteSettings.emergencyBannerText}
                    onChange={e => setSiteSettings({ ...siteSettings, emergencyBannerText: e.target.value })}
                    placeholder="e.g. Emergency Flood & Slum Relief Kitchens Active across 12 zones"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">The primary real-time headline displayed to every website visitor.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trust & Transparency Tagline
                  </label>
                  <input
                    type="text"
                    value={siteSettings.trustTagline || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, trustTagline: e.target.value })}
                    placeholder="e.g. 100% Verified Transparency • Min Donation ₹20"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Secondary trust guarantee displayed on the right strip.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Donation Anchor (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={siteSettings.minDonationINR}
                    onChange={e => setSiteSettings({ ...siteSettings, minDonationINR: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Reflected in public trust badges and donation forms.</p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setSiteSettings({
                    ...siteSettings,
                    emergencyBannerEnabled: true,
                    emergencyBannerBadge: 'Active Relief',
                    emergencyBannerText: 'Emergency Flood & Slum Relief Kitchens Active across 12 zones',
                    trustTagline: '100% Verified Transparency • Min Donation ₹20',
                    helplinePhone: '+91 1800-SEVA-AID',
                    minDonationINR: 20,
                    bannerTheme: 'orange'
                  })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Reset Defaults
                </button>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save & Publish Announcement Strip</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: REAL-TIME VERIFIED METRICS */}
        {/* ============================================================ */}
        {activeTab === 'verified-metrics' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Real-Time Verified Metrics Management
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                      Official Public KPIs & Impact Transparency
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl pt-1">
                  Maintain the verified impact numbers published on the homepage. Enter verified numbers below. 
                  <strong className="text-slate-700"> If you do not write any number or leave a field blank, it will strictly evaluate and display as 0 for all.</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadDemoBaseline}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  title="Load sample figures (1.25L Meals / 48K People)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Load Sample Figures</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetVerifiedMetrics}
                  disabled={savingVerifiedMetrics}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                  title="Reset all 5 metrics to 0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reset All to 0</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveVerifiedMetrics()}
                  disabled={savingVerifiedMetrics}
                  className="py-2 px-5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  {savingVerifiedMetrics ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Verified Metrics</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Zero-Default Rule Notice Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Admin Maintenance Policy: Omitted Values Default Strictly to 0</p>
                <p className="text-[11px] text-amber-800">
                  Every field below directly dictates what donors and beneficiaries see on the live platform. If you clear any input or leave it empty, the public website renders <strong>0</strong> (or <strong>₹0</strong> for aid). No fake mock figures or hidden offsets will be injected.
                </p>
              </div>
            </div>

            {/* Form with 5 Metric Cards */}
            <form onSubmit={handleSaveVerifiedMetrics} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* 1. Wholesome Meals Served */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-orange-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      Card 1
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Wholesome Meals Served
                    </label>
                    <p className="text-[10px] text-slate-500">Cooked fresh & safely distributed</p>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (Defaults to 0)"
                      value={verifiedMetrics.totalMealsServed === 0 ? '' : verifiedMetrics.totalMealsServed}
                      onChange={e => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setVerifiedMetrics({ ...verifiedMetrics, totalMealsServed: val });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">+</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalMealsServed: (Number(verifiedMetrics.totalMealsServed) || 0) + 1000 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +1K
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalMealsServed: (Number(verifiedMetrics.totalMealsServed) || 0) + 10000 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +10K
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalMealsServed: 0 })}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all ml-auto"
                    >
                      Set 0
                    </button>
                  </div>
                </div>

                {/* 2. Verified People Helped */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-indigo-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      Card 2
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Verified People Helped
                    </label>
                    <p className="text-[10px] text-slate-500">Unique individuals & families</p>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (Defaults to 0)"
                      value={verifiedMetrics.totalPeopleHelped === 0 ? '' : verifiedMetrics.totalPeopleHelped}
                      onChange={e => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setVerifiedMetrics({ ...verifiedMetrics, totalPeopleHelped: val });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">+</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalPeopleHelped: (Number(verifiedMetrics.totalPeopleHelped) || 0) + 500 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +500
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalPeopleHelped: (Number(verifiedMetrics.totalPeopleHelped) || 0) + 5000 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +5K
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalPeopleHelped: 0 })}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all ml-auto"
                    >
                      Set 0
                    </button>
                  </div>
                </div>

                {/* 3. Active Ground Volunteers */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-emerald-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Card 3
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Active Ground Volunteers
                    </label>
                    <p className="text-[10px] text-slate-500">Verified ID badge holders</p>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (Defaults to 0)"
                      value={verifiedMetrics.activeVolunteersCount === 0 ? '' : verifiedMetrics.activeVolunteersCount}
                      onChange={e => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setVerifiedMetrics({ ...verifiedMetrics, activeVolunteersCount: val });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">+</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, activeVolunteersCount: (Number(verifiedMetrics.activeVolunteersCount) || 0) + 10 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, activeVolunteersCount: (Number(verifiedMetrics.activeVolunteersCount) || 0) + 50 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, activeVolunteersCount: 0 })}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all ml-auto"
                    >
                      Set 0
                    </button>
                  </div>
                </div>

                {/* 4. Distribution Events */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-amber-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Card 4
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Distribution Events
                    </label>
                    <p className="text-[10px] text-slate-500">Disaster camps & slum visits</p>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (Defaults to 0)"
                      value={verifiedMetrics.totalDistributionsCount === 0 ? '' : verifiedMetrics.totalDistributionsCount}
                      onChange={e => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setVerifiedMetrics({ ...verifiedMetrics, totalDistributionsCount: val });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">+</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalDistributionsCount: (Number(verifiedMetrics.totalDistributionsCount) || 0) + 5 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalDistributionsCount: (Number(verifiedMetrics.totalDistributionsCount) || 0) + 25 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +25
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalDistributionsCount: 0 })}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all ml-auto"
                    >
                      Set 0
                    </button>
                  </div>
                </div>

                {/* 5. 100% Traceable Aid */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3 hover:border-rose-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Card 5
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      100% Traceable Aid
                    </label>
                    <p className="text-[10px] text-slate-500">Starting from ₹20 minimum</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="0 (Defaults to ₹0)"
                      value={verifiedMetrics.totalDonated === 0 ? '' : verifiedMetrics.totalDonated}
                      onChange={e => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setVerifiedMetrics({ ...verifiedMetrics, totalDonated: val });
                      }}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalDonated: (Number(verifiedMetrics.totalDonated) || 0) + 10000 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +10K
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalDonated: (Number(verifiedMetrics.totalDonated) || 0) + 50000 })}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-all"
                    >
                      +50K
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifiedMetrics({ ...verifiedMetrics, totalDonated: 0 })}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all ml-auto"
                    >
                      Set 0
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Section Copy Customization */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setMetricsCustomCopyOpen(!metricsCustomCopyOpen)}
                  className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">Customize Section Badge, Headings & Subtitles</span>
                  </div>
                  <span className="text-xs font-bold text-orange-600">
                    {metricsCustomCopyOpen ? 'Hide Customization ▲' : 'Edit Text ▼'}
                  </span>
                </button>

                {metricsCustomCopyOpen && (
                  <div className="p-5 space-y-4 border-t border-slate-200">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={verifiedMetrics.badgeText || ''}
                          onChange={e => setVerifiedMetrics({ ...verifiedMetrics, badgeText: e.target.value })}
                          placeholder="REAL-TIME VERIFIED METRICS"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Main Headline</label>
                        <input
                          type="text"
                          value={verifiedMetrics.heading || ''}
                          onChange={e => setVerifiedMetrics({ ...verifiedMetrics, heading: e.target.value })}
                          placeholder="Every Rupee Accounted For, Every Meal Counted"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Explanatory Subtitle</label>
                      <input
                        type="text"
                        value={verifiedMetrics.subheading || ''}
                        onChange={e => setVerifiedMetrics({ ...verifiedMetrics, subheading: e.target.value })}
                        placeholder="Data verified directly through ground distribution logs and administrator-reviewed photographic proof."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Save Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Last updated: <span className="font-semibold text-slate-700">{verifiedMetrics.updatedAt ? new Date(verifiedMetrics.updatedAt).toLocaleString('en-IN') : 'Just now'}</span>
                  {verifiedMetrics.updatedBy && <span> by {verifiedMetrics.updatedBy}</span>}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetVerifiedMetrics}
                    disabled={savingVerifiedMetrics}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Clear All to 0
                  </button>

                  <button
                    type="submit"
                    disabled={savingVerifiedMetrics}
                    className="py-2.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{savingVerifiedMetrics ? 'Saving & Publishing...' : 'Save & Publish Verified Metrics'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Live Homepage Section Replica Preview */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Homepage Section Preview
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Exact live replica • Real-time reactive preview
                </span>
              </div>

              <div className="p-6 sm:p-10 bg-white">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    {verifiedMetrics.badgeText || 'REAL-TIME VERIFIED METRICS'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    {verifiedMetrics.heading || 'Every Rupee Accounted For, Every Meal Counted'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {verifiedMetrics.subheading || 'Data verified directly through ground distribution logs and administrator-reviewed photographic proof.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                  {/* Card 1 */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center space-y-2 group hover:border-orange-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {(Number(verifiedMetrics.totalMealsServed) || 0) > 0
                        ? (Number(verifiedMetrics.totalMealsServed) || 0).toLocaleString('en-IN') + '+'
                        : '0'}
                    </h4>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{verifiedMetrics.mealsLabel || 'Wholesome Meals Served'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{verifiedMetrics.mealsSublabel || 'Cooked fresh & safely distributed'}</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center space-y-2 group hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {(Number(verifiedMetrics.totalPeopleHelped) || 0) > 0
                        ? (Number(verifiedMetrics.totalPeopleHelped) || 0).toLocaleString('en-IN') + '+'
                        : '0'}
                    </h4>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{verifiedMetrics.peopleLabel || 'Verified People Helped'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{verifiedMetrics.peopleSublabel || 'Unique individuals & families'}</p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center space-y-2 group hover:border-emerald-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {(Number(verifiedMetrics.activeVolunteersCount) || 0) > 0
                        ? (Number(verifiedMetrics.activeVolunteersCount) || 0).toLocaleString('en-IN') + '+'
                        : '0'}
                    </h4>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{verifiedMetrics.volunteersLabel || 'Active Ground Volunteers'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{verifiedMetrics.volunteersSublabel || 'Verified ID badge holders'}</p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center space-y-2 group hover:border-amber-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {(Number(verifiedMetrics.totalDistributionsCount) || 0) > 0
                        ? (Number(verifiedMetrics.totalDistributionsCount) || 0).toLocaleString('en-IN') + '+'
                        : '0'}
                    </h4>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{verifiedMetrics.distributionsLabel || 'Distribution Events'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{verifiedMetrics.distributionsSublabel || 'Disaster camps & slum visits'}</p>
                    </div>
                  </div>

                  {/* Card 5 */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center space-y-2 group hover:border-rose-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <HeartHandshake className="w-6 h-6 text-rose-600" />
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {formatINR(Number(verifiedMetrics.totalDonated) || 0)}
                    </h4>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{verifiedMetrics.donatedLabel || '100% Traceable Aid'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{verifiedMetrics.donatedSublabel || 'Starting from ₹20 minimum'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">How It Works Lifecycle (Section 2)</h2>
                <p className="text-xs text-slate-500">
                  Manage the transparent step-by-step donation-to-meal pipeline shown on the public website.
                </p>
              </div>
              <button
                onClick={openNewHIWModal}
                className="py-2 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Workflow Step</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {howItWorksSteps.map((step) => (
                <div key={step.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-mono text-amber-600">{step.number}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditHIWModal(step)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHIW(step.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: FOOD DONATIONS & RESCUE PICKUPS */}
        {/* ============================================================ */}
        {activeTab === 'food-donations' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Food Rescue & Surplus Donations (Section 3)</h2>
                <p className="text-xs text-slate-500">
                  Track restaurant surplus, examine safe consumption deadlines, and dispatch volunteer mobile vans.
                </p>
              </div>
              <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                {foodDonations.length} Total Offers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Donor & Phone</th>
                    <th className="py-3 px-4">Food & Servings</th>
                    <th className="py-3 px-4">Pickup Location</th>
                    <th className="py-3 px-4">Safe Until</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-lg text-right">Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {foodDonations.map(food => {
                    const fId = food.id || (food as any)._id;
                    return (
                      <tr key={fId} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{food.donorName}</p>
                          <p className="text-[11px] text-slate-500">{food.donorPhone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{food.foodType}</p>
                          <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                            {food.estimatedServings} servings ({food.dietaryCategory})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{food.pickupLocation}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{new Date(food.safeUntil).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            food.status === 'Distributed' ? 'bg-emerald-100 text-emerald-800' :
                            food.status === 'Collected' ? 'bg-blue-100 text-blue-800' :
                            food.status === 'Assigned' ? 'bg-amber-100 text-amber-800' :
                            food.status === 'Expired' ? 'bg-slate-200 text-slate-700' :
                            'bg-orange-100 text-orange-800 animate-pulse'
                          }`}>
                            {food.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={food.status}
                            onChange={e => handleFoodDonationStatus(fId, e.target.value as any)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Assigned">Assigned (Van Dispatched)</option>
                            <option value="Collected">Collected</option>
                            <option value="Distributed">Distributed (Done)</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: RECENT GROUND DISTRIBUTIONS (CRUD & VISIBILITY) */}
        {/* ============================================================ */}
        {activeTab === 'distributions' && (
          <div className="space-y-6">
            {/* Top Control Bar & Live Status Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Camera className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-black text-slate-900">Recent Ground Distributions</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Live Field Missions
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    Manage real-world food distributions with photo proof, volunteer credits, and meal counts.
                    If no distributions exist or if disabled, the entire {"<section id=\"distributions\">"} is completely removed from the main website DOM.
                  </p>
                </div>

                {/* Master Switch & Drawer Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setDistSettingsDrawerOpen(!distSettingsDrawerOpen)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Section Copy & Headings</span>
                  </button>

                  <button
                    onClick={openNewDistributionModal}
                    className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Log Distribution</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={distributionSectionSettings?.isEnabled !== false}
                      onChange={(e) => handleToggleDistributionSectionEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Master Section Toggle: {distributionSectionSettings?.isEnabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {distributionSectionSettings?.isEnabled !== false
                        ? 'Master toggle is ON. Section displays if 1 or more verified distributions are logged.'
                        : 'Master toggle is OFF — entire div is removed from main website.'}
                    </p>
                  </div>
                </div>

                {/* Quick reset/clear shortcuts */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSampleDistributions}
                    className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Restore Sample Missions
                  </button>
                  <button
                    onClick={handleClearAllDistributions}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-all"
                  >
                    Clear All (Remove Div)
                  </button>
                </div>
              </div>

              {/* Real-time Website State Box */}
              <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                distributionSectionSettings?.isEnabled !== false && distributions.filter(d => d.status !== 'Draft').length > 0
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    distributionSectionSettings?.isEnabled !== false && distributions.filter(d => d.status !== 'Draft').length > 0
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`} />
                  <span className="font-bold">
                    {distributionSectionSettings?.isEnabled !== false && distributions.filter(d => d.status !== 'Draft').length > 0
                      ? `LIVE ON MAIN WEBSITE: ${distributions.filter(d => d.status !== 'Draft').length} verified ground mission(s) displaying.`
                      : distributionSectionSettings?.isEnabled === false
                        ? 'DIV COMPLETELY REMOVED: Section master toggle is OFF.'
                        : 'DIV COMPLETELY REMOVED: 0 distribution events logged. Main site omits section completely.'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 hidden md:inline">
                  {"<section id=\"distributions\">"}
                </span>
              </div>
            </div>

            {/* Section Copy Settings Drawer */}
            {distSettingsDrawerOpen && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Customize Section Copy & Headings</h3>
                  </div>
                  <button
                    onClick={() => setDistSettingsDrawerOpen(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSaveDistributionSectionSettings} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Text</label>
                      <input
                        type="text"
                        value={distributionSectionSettings.badgeText || ''}
                        onChange={(e) => setDistributionSectionSettings({ ...distributionSectionSettings, badgeText: e.target.value })}
                        placeholder="RECENT GROUND MISSIONS"
                        className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Verified Tag Text</label>
                      <input
                        type="text"
                        value={distributionSectionSettings.verifiedBadgeText || ''}
                        onChange={(e) => setDistributionSectionSettings({ ...distributionSectionSettings, verifiedBadgeText: e.target.value })}
                        placeholder="PHOTO & BENEFICIARY VERIFIED"
                        className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={distributionSectionSettings.heading || ''}
                      onChange={(e) => setDistributionSectionSettings({ ...distributionSectionSettings, heading: e.target.value })}
                      placeholder="Recent Ground Distributions"
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Section Subheading</label>
                    <textarea
                      rows={2}
                      value={distributionSectionSettings.subheading || ''}
                      onChange={(e) => setDistributionSectionSettings({ ...distributionSectionSettings, subheading: e.target.value })}
                      placeholder="Every meal handed over is recorded with verifiable photographic proof, timestamps, and on-ground volunteer notes."
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDistSettingsDrawerOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingDistSettings}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      {savingDistSettings ? 'Saving...' : 'Save Headings'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Zero state notification when no distributions exist */}
            {distributions.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center shadow-sm">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Zero Ground Distributions in Database</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                  Per strict platform rule, because you have not written or logged any distributions,
                  the entire {"<section id=\"distributions\">"} container is <strong>completely removed from the main website</strong>.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={openNewDistributionModal}
                    className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    + Log First Distribution
                  </button>
                  <button
                    onClick={handleLoadSampleDistributions}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Restore Sample Missions
                  </button>
                </div>
              </div>
            ) : (
              /* Distributions Cards Grid */
              <div className="grid md:grid-cols-2 gap-6">
                {distributions.map((dist) => {
                  const dId = dist.id || (dist as any)._id;
                  const vols = Array.isArray(dist.volunteersInvolved)
                    ? dist.volunteersInvolved.join(', ')
                    : dist.volunteersInvolved || 'Ground Volunteers';

                  return (
                    <div
                      key={dId}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* Photo Banner with Badges */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden group">
                          {dist.proofPhoto ? (
                            <img
                              src={dist.proofPhoto}
                              alt={dist.campaignTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Camera className="w-10 h-10" />
                            </div>
                          )}

                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-orange-400" />
                              {dist.location}
                            </span>
                            <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 font-medium text-[10px] px-2 py-0.5 rounded-full">
                              {dist.date}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                              dist.status === 'Verified'
                                ? 'bg-emerald-600 text-white'
                                : dist.status === 'In Progress'
                                ? 'bg-blue-600 text-white'
                                : dist.status === 'Completed'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700 text-white'
                            }`}>
                              {dist.status}
                            </span>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-5 space-y-3">
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {dist.campaignTitle}
                          </h4>

                          {/* Impact KPIs */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meals Served</span>
                              <span className="text-base font-black text-orange-600">
                                {Number(dist.mealsDistributed).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">People Helped</span>
                              <span className="text-base font-black text-slate-800">
                                {Number(dist.beneficiariesCount).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Food source and volunteers */}
                          <div className="space-y-1 text-xs text-slate-600">
                            {dist.foodSource && (
                              <p className="line-clamp-1">
                                <span className="font-semibold text-slate-700">Source:</span> {dist.foodSource}
                              </p>
                            )}
                            <p className="line-clamp-1">
                              <span className="font-semibold text-slate-700">Team:</span> {vols}
                            </p>
                            {dist.notes && (
                              <p className="text-[11px] text-slate-500 italic line-clamp-2 mt-1">
                                &ldquo;{dist.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          ID: {String(dId).slice(-6)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditDistributionModal(dist)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                            title="Edit Distribution"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDistribution(dId)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                            title="Delete Distribution"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: TRANSPARENCY & EXPENSES (CRUD) */}
        {/* ============================================================ */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Transparency & Expenses (Section 4)</h2>
                <p className="text-xs text-slate-500">Every rupee spent on mandi staples, transit, or packaging is logged publicly.</p>
              </div>
              <button
                onClick={openNewExpenseModal}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log New Expense</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Approved By</th>
                    <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map(exp => {
                    const eId = exp.id || (exp as any)._id;
                    return (
                      <tr key={eId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatINR(exp.amount)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{exp.category}</td>
                        <td className="py-3 px-4 text-slate-600">{exp.campaignTitle}</td>
                        <td className="py-3 px-4 text-slate-600">{exp.description}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{exp.approvedBy}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditExpenseModal(exp)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(eId)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: MANAGING COMMITTEE (CRUD) */}
        {/* ============================================================ */}
        {activeTab === 'committee' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Managing Committee & Governance (Section 5)</h2>
                <p className="text-xs text-slate-500">Manage Board of Trustees, directors, coordinators, and public disclosures.</p>
              </div>
              <button
                onClick={openNewCommitteeModal}
                className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Committee Member</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {committee.map(m => (
                <div key={m.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={m.photo} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-orange-500/40" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                        <p className="text-xs text-orange-600 font-semibold">{m.designation}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{m.bio}</p>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700">
                      <strong>Responsibilities:</strong> {m.responsibilities}
                    </div>
                  </div>

                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditCommitteeModal(m)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCommittee(m.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: STORIES & BLOGS (CRUD & VISIBILITY) */}
        {/* ============================================================ */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            {/* Top Control Bar & Live Status Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-black text-slate-900">Stories & Blogs (Section 6)</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Human Impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    Publish verified ground-level relief stories and beneficiary transformations.
                    If no stories exist or if disabled, the entire {"<section id=\"stories\">"} is completely removed from the main website DOM.
                  </p>
                </div>

                {/* Master Switch & Drawer Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setStorySettingsDrawerOpen(!storySettingsDrawerOpen)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Section Copy & Headings</span>
                  </button>

                  <button
                    onClick={openNewStoryModal}
                    className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish New Story</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storySectionSettings?.isEnabled !== false}
                      onChange={(e) => handleToggleStorySectionEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Master Section Toggle: {storySectionSettings?.isEnabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {storySectionSettings?.isEnabled !== false
                        ? 'Master toggle is ON. Section displays if 1 or more verified stories are published.'
                        : 'Master toggle is OFF — entire div is removed from main website.'}
                    </p>
                  </div>
                </div>

                {/* Quick reset/clear shortcuts */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSampleStories}
                    className="text-[11px] font-semibold text-slate-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Restore Sample Stories
                  </button>
                  <button
                    onClick={handleClearAllStories}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-all"
                  >
                    Clear All (Remove Div)
                  </button>
                </div>
              </div>

              {/* Real-time Website State Box */}
              <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                storySectionSettings?.isEnabled !== false && stories.length > 0
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    storySectionSettings?.isEnabled !== false && stories.length > 0
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`} />
                  <span className="font-bold">
                    {storySectionSettings?.isEnabled !== false && stories.length > 0
                      ? `LIVE ON MAIN WEBSITE: ${stories.length} verified impact story(ies) displaying.`
                      : storySectionSettings?.isEnabled === false
                        ? 'DIV COMPLETELY REMOVED: Section master toggle is OFF.'
                        : 'DIV COMPLETELY REMOVED: 0 stories logged. Main site omits section completely.'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 hidden md:inline">
                  {"<section id=\"stories\">"}
                </span>
              </div>
            </div>

            {/* Section Copy Settings Drawer */}
            {storySettingsDrawerOpen && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">Customize Section Copy & Headings</h3>
                  </div>
                  <button
                    onClick={() => setStorySettingsDrawerOpen(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSaveStorySectionSettings} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Text</label>
                      <input
                        type="text"
                        value={storySectionSettings.badgeText || ''}
                        onChange={(e) => setStorySectionSettings({ ...storySectionSettings, badgeText: e.target.value })}
                        placeholder="Human Impact"
                        className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Consent Tag Text</label>
                      <input
                        type="text"
                        value={storySectionSettings.consentBadgeText || ''}
                        onChange={(e) => setStorySectionSettings({ ...storySectionSettings, consentBadgeText: e.target.value })}
                        placeholder="Beneficiary Consent Verified"
                        className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={storySectionSettings.heading || ''}
                      onChange={(e) => setStorySectionSettings({ ...storySectionSettings, heading: e.target.value })}
                      placeholder="Stories of Hope, Dignity & Survival"
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Section Subheading</label>
                    <textarea
                      rows={2}
                      value={storySectionSettings.subheading || ''}
                      onChange={(e) => setStorySectionSettings({ ...storySectionSettings, subheading: e.target.value })}
                      placeholder="Behind every ₹20 or ₹500 donated is a living human being whose day was made brighter with food, compassion, and community respect."
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStorySettingsDrawerOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingStorySettings}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      {savingStorySettings ? 'Saving...' : 'Save Headings'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Zero-State Empty State Card */}
            {stories.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center shadow-sm">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-rose-600">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Zero Stories in Database</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                  Per strict platform rule, because you have not written or published any stories,
                  the entire {"<section id=\"stories\">"} container is <strong>completely removed from the main website</strong>.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={openNewStoryModal}
                    className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    + Publish First Story
                  </button>
                  <button
                    onClick={handleLoadSampleStories}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Restore Sample Stories
                  </button>
                </div>
              </div>
            ) : (
              /* Stories Cards Grid */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map(story => (
                  <div key={story.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <img src={story.image} alt={story.title} className="w-full h-44 object-cover" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                          <span>{story.location}</span>
                          <span>{story.date}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{story.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{story.summary}</p>
                        <div className="p-2.5 bg-rose-50 rounded-xl text-[11px] font-semibold text-rose-950">
                          {story.impactText}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Beneficiary: <strong>{story.beneficiaryName}</strong></span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditStoryModal(story)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: FAQ (CRUD) */}
        {/* ============================================================ */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">FAQ System (Section 7)</h2>
                <p className="text-xs text-slate-500">
                  Control public answers regarding the ₹20 minimum floor, QR audit security, and tax exemptions.
                </p>
              </div>
              <button
                onClick={openNewFAQModal}
                className="py-2 px-3.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Question & Answer</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map(f => (
                <div key={f.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{f.q}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditFAQModal(f)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(f.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: VOLUNTEERS (STRICT 4 VOLUNTEER RULE) */}
        {/* ============================================================ */}
        {activeTab === 'volunteers' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">Volunteer Approval & Roster Desk</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    quotas?.volunteers.isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Capacity: {quotas ? quotas.volunteers.current : volunteers.length} / 4 Max
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform policy strictly caps volunteers at 4 members. Once 4 approved volunteers exist, further approvals are blocked.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
                  <button
                    onClick={() => setVolFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${volFilter === 'all' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                  >
                    All ({volunteers.length})
                  </button>
                  <button
                    onClick={() => setVolFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition-all ${volFilter === 'pending' ? 'bg-amber-500 text-white font-bold' : 'text-slate-500'}`}
                  >
                    Pending ({pendingVols.length})
                  </button>
                  <button
                    onClick={() => setVolFilter('approved')}
                    className={`px-3 py-1 rounded-lg transition-all ${volFilter === 'approved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
                  >
                    Approved ({volunteers.filter(v => v.status === 'Approved').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Quota alert if at capacity */}
            {quotas?.volunteers.isFull && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Volunteer Force is Full (4/4):</strong> To approve a new volunteer, you must first suspend or remove an existing volunteer.
                </span>
              </div>
            )}

            {/* Search filter */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={volSearch}
                onChange={e => setVolSearch(e.target.value)}
                placeholder="Search by volunteer name, ID, or area..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">ID</th>
                    <th className="py-3 px-4">Volunteer Details</th>
                    <th className="py-3 px-4">Location & Skills</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 rounded-r-lg text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                        No volunteer records found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map(vol => {
                      const vId = vol.id || (vol as any)._id;
                      return (
                        <tr key={vId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-orange-600">{vol.volunteerId}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-800">{vol.name}</p>
                            <p className="text-[11px] text-slate-500">{vol.email}</p>
                            <p className="text-[11px] text-slate-500">{vol.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {vol.area}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vol.skills?.slice(0, 2).map(sk => (
                                <span key={sk} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{vol.availability}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              vol.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              vol.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' :
                              vol.status === 'Suspended' ? 'bg-slate-200 text-slate-700' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {vol.status === 'Approved' && <Check className="w-3 h-3" />}
                              {vol.status === 'Pending' && <Clock className="w-3 h-3" />}
                              {vol.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {vol.status !== 'Approved' && (
                                <button
                                  onClick={() => handleVolunteerAction(vId, 'Approved')}
                                  disabled={quotas?.volunteers.isFull}
                                  className={`px-3 py-1.5 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all ${
                                    quotas?.volunteers.isFull ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                                  }`}
                                  title={quotas?.volunteers.isFull ? 'Cannot approve: capacity limit of 4 volunteers reached' : 'Approve volunteer'}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {vol.status === 'Pending' && (
                                <button
                                  onClick={() => handleVolunteerAction(vId, 'Rejected')}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition-all"
                                >
                                  Reject
                                </button>
                              )}

                              {vol.status === 'Approved' && (
                                <button
                                  onClick={() => handleVolunteerAction(vId, 'Suspended')}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all"
                                >
                                  Suspend
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteVolunteer(vId)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                title="Delete Volunteer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 9: SETTINGS & METRICS CALIBRATION */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Website Control & Impact Metric Calibration</h2>
              <p className="text-xs text-slate-500">
                Control sitewide announcements, emergency helpline numbers, and public impact counters (meals delivered, people assisted).
              </p>
            </div>

            <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Dedicated Top Emergency / Trust Announcement Strip Desk</h3>
                  <p className="text-[11px] text-slate-500">Live preview, crisis presets, custom color themes, and real-time helpline configuration.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('announcement-strip')}
                className="py-2 px-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto flex-shrink-0"
              >
                <span>Open Announcement Strip Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-950 uppercase tracking-wide">Emergency Announcement Banner</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.emergencyBannerEnabled}
                      onChange={e => setSiteSettings({ ...siteSettings, emergencyBannerEnabled: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Banner Visible</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banner Alert Message</label>
                  <input
                    type="text"
                    value={siteSettings.emergencyBannerText}
                    onChange={e => setSiteSettings({ ...siteSettings, emergencyBannerText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Title</label>
                  <input
                    type="text"
                    value={siteSettings.siteTitle}
                    onChange={e => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    value={siteSettings.helplinePhone}
                    onChange={e => setSiteSettings({ ...siteSettings, helplinePhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform Tagline</label>
                  <input
                    type="text"
                    value={siteSettings.tagline}
                    onChange={e => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Donation INR (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={siteSettings.minDonationINR}
                    onChange={e => setSiteSettings({ ...siteSettings, minDonationINR: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-500" />
                  Public Impact Counters & Goal Calibration
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  These baseline numbers adjust the counters shown in the Hero, Impact Stats, and Transparency sections.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Meals Served Counter (Baseline)</label>
                    <input
                      type="number"
                      step="100"
                      value={siteSettings.totalMealsOffset}
                      onChange={e => setSiteSettings({ ...siteSettings, totalMealsOffset: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total People Assisted Counter (Baseline)</label>
                    <input
                      type="number"
                      step="100"
                      value={siteSettings.totalPeopleOffset}
                      onChange={e => setSiteSettings({ ...siteSettings, totalPeopleOffset: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Active Volunteer Display Baseline</label>
                    <input
                      type="number"
                      value={siteSettings.activeVolunteersOffset}
                      onChange={e => setSiteSettings({ ...siteSettings, activeVolunteersOffset: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Platform Donation Goal (₹)</label>
                    <input
                      type="number"
                      step="50000"
                      value={siteSettings.targetDonationGoal}
                      onChange={e => setSiteSettings({ ...siteSettings, targetDonationGoal: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="py-3 px-6 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{savingSettings ? 'Saving Settings...' : 'Save Website Controls'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 10: QR APPROVALS */}
        {/* ============================================================ */}
        {activeTab === 'qrs' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">QR Payment Approval Workflow</h2>
                <p className="text-xs text-slate-500">
                  Volunteers and coordinators upload payment QRs. Unapproved QRs are held until Admin verification to prevent fraud.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                {pendingQRs.length} Pending Review
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrs.map(qr => {
                const qId = qr.id || (qr as any)._id;
                return (
                  <div
                    key={qId}
                    className={`p-5 rounded-2xl border ${
                      qr.status === 'Active' ? 'border-emerald-200 bg-emerald-50/20' :
                      qr.status === 'Pending' ? 'border-amber-300 bg-amber-50/30' :
                      'border-slate-200 bg-slate-50'
                    } space-y-4`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-500">{qr.qrId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        qr.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        qr.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {qr.status}
                      </span>
                    </div>

                    <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
                      <img src={qr.qrImageUrl} alt={qr.title} className="w-32 h-32 mx-auto rounded" />
                      <p className="font-mono text-xs font-bold text-slate-800 mt-2">{qr.upiId}</p>
                      <p className="text-[11px] text-slate-500">{qr.accountName}</p>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <p><strong>Title:</strong> {qr.title}</p>
                      <p><strong>Location:</strong> {qr.location}</p>
                      <p><strong>Uploaded By:</strong> {qr.uploadedBy}</p>
                    </div>

                    {qr.status === 'Pending' && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleQRAction(qId, 'approve')}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Activate</span>
                        </button>
                        <button
                          onClick={() => handleQRAction(qId, 'reject')}
                          className="py-2 px-3 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 11: AUDIT LOGS */}
        {/* ============================================================ */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">Immutable Audit Trail</h2>
              <p className="text-xs text-slate-500">Every action performed across the platform is permanently logged with timestamps.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-lg">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4 rounded-r-lg">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-500">{log.timestamp}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">{log.user}</td>
                      <td className="py-2.5 px-4 text-orange-600 font-bold">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-600">{log.entity}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* MODAL 1: CAMPAIGN (CREATE / EDIT) */}
      {showCampModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingCampId ? 'Edit Campaign Details' : 'Launch New Relief Campaign'}
              </h3>
              <button onClick={() => setShowCampModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveCampaign} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campTitle}
                  onChange={e => setCampTitle(e.target.value)}
                  placeholder="e.g. Winter Nutrition Kits for Homeless"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Target Amount (INR ₹)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={campTarget}
                    onChange={e => setCampTarget(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Target Location</label>
                  <input
                    type="text"
                    required
                    value={campLocation}
                    onChange={e => setCampLocation(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={campCategory}
                    onChange={e => setCampCategory(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Food Relief">Food Relief</option>
                    <option value="Disaster">Disaster</option>
                    <option value="Education">Education</option>
                    <option value="Community Kitchen">Community Kitchen</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Status</label>
                  <select
                    value={campStatus}
                    onChange={e => setCampStatus(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={campCover}
                  onChange={e => setCampCover(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={campDesc}
                  onChange={e => setCampDesc(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={campEmergency}
                  onChange={e => setCampEmergency(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <span className="font-bold text-slate-800">Mark as Critical Emergency Drive</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl mt-2 shadow"
              >
                {editingCampId ? 'Save Campaign Changes' : 'Launch Live Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GROUND DISTRIBUTION MODAL (CREATE / EDIT) */}
      {showDistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  {editingDistId ? 'Edit Ground Distribution Mission' : 'Log New Ground Distribution'}
                </h3>
              </div>
              <button onClick={() => setShowDistModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveDistribution} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Campaign / Mission Title</label>
                <input
                  type="text"
                  required
                  value={distCampaignTitle}
                  onChange={e => setDistCampaignTitle(e.target.value)}
                  placeholder="e.g. Daily Slum Meal Distribution - Zone 4"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Location / Ward</label>
                  <input
                    type="text"
                    required
                    value={distLocation}
                    onChange={e => setDistLocation(e.target.value)}
                    placeholder="e.g. Sealdah Slum Area, Kolkata"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Distribution Date</label>
                  <input
                    type="date"
                    required
                    value={distDate}
                    onChange={e => setDistDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Meals Distributed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={distMealsDistributed}
                    onChange={e => setDistMealsDistributed(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Beneficiaries (People)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={distBeneficiariesCount}
                    onChange={e => setDistBeneficiariesCount(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Food Source / Kitchen</label>
                  <input
                    type="text"
                    value={distFoodSource}
                    onChange={e => setDistFoodSource(e.target.value)}
                    placeholder="e.g. Central Seva Relief Kitchen"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Mission Status</label>
                  <select
                    value={distStatus}
                    onChange={e => setDistStatus(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  >
                    <option value="Verified">Verified (Public)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft (Hidden from Public)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Proof Photo URL (Geotagged / Field Evidence)</label>
                <input
                  type="url"
                  required
                  value={distProofPhoto}
                  onChange={e => setDistProofPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Volunteers Involved (comma-separated)</label>
                <input
                  type="text"
                  value={distVolunteers}
                  onChange={e => setDistVolunteers(e.target.value)}
                  placeholder="e.g. Amitabh Roy, Sneha Banerjee, Rajesh Kumar"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Mission Notes / Impact Summary</label>
                <textarea
                  rows={2}
                  value={distNotes}
                  onChange={e => setDistNotes(e.target.value)}
                  placeholder="e.g. Served fresh khichdi and boiled eggs to flood-affected families. 100% verified on ground."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowDistModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all"
                >
                  {editingDistId ? 'Save Mission Record' : 'Publish Ground Distribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: HOW IT WORKS STEP */}
      {showHIWModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingHIWId ? 'Edit Workflow Step' : 'Add How It Works Step'}
              </h3>
              <button onClick={() => setShowHIWModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveHIW} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Step Number</label>
                  <input
                    type="text"
                    required
                    value={hiwNumber}
                    onChange={e => setHiwNumber(e.target.value)}
                    placeholder="01"
                    className="w-full p-2 border rounded-xl font-bold font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold block mb-1">Step Title</label>
                  <input
                    type="text"
                    required
                    value={hiwTitle}
                    onChange={e => setHiwTitle(e.target.value)}
                    placeholder="e.g. Verified Distribution"
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Step Description</label>
                <textarea
                  required
                  rows={3}
                  value={hiwDesc}
                  onChange={e => setHiwDesc(e.target.value)}
                  placeholder="Explain how Seva executes this stage..."
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl mt-2"
              >
                {editingHIWId ? 'Update Step' : 'Add Step to Public Site'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingExpenseId ? 'Edit Expense Entry' : 'Log Verified Relief Expense'}
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Amount (INR ₹)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={expAmount}
                    onChange={e => setExpAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value as any)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="Food Purchases">Food Purchases</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={expCamp}
                  onChange={e => setExpCamp(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Expense Description</label>
                <textarea
                  required
                  rows={3}
                  value={expDesc}
                  onChange={e => setExpDesc(e.target.value)}
                  placeholder="e.g. Wholesale purchase of 500kg rice from local mandi..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-2"
              >
                {editingExpenseId ? 'Update Expense' : 'Save to Transparency Ledger'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: COMMITTEE MEMBER */}
      {showCommitteeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingCommitteeId ? 'Edit Committee Member' : 'Add Committee Member'}
              </h3>
              <button onClick={() => setShowCommitteeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveCommittee} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Member Name</label>
                <input
                  type="text"
                  required
                  value={commName}
                  onChange={e => setCommName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={commDesignation}
                  onChange={e => setCommDesignation(e.target.value)}
                  placeholder="e.g. Trustee & Operations Director"
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Photo URL</label>
                <input
                  type="url"
                  required
                  value={commPhoto}
                  onChange={e => setCommPhoto(e.target.value)}
                  className="w-full p-2 border rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Bio / Background</label>
                <textarea
                  required
                  rows={2}
                  value={commBio}
                  onChange={e => setCommBio(e.target.value)}
                  placeholder="Brief background and career summary..."
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Key Responsibilities</label>
                <input
                  type="text"
                  required
                  value={commResponsibilities}
                  onChange={e => setCommResponsibilities(e.target.value)}
                  placeholder="e.g. Food procurement, audit & accounts"
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2"
              >
                {editingCommitteeId ? 'Update Member' : 'Save Committee Member'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: STORY */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingStoryId ? 'Edit Success Story / Blog' : 'Publish New Impact Story'}
              </h3>
              <button onClick={() => setShowStoryModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveStory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Story Title</label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={e => setStoryTitle(e.target.value)}
                  placeholder="e.g. From Near Starvation to Hope: Lakshmi's Family"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    value={storyBeneficiary}
                    onChange={e => setStoryBeneficiary(e.target.value)}
                    placeholder="e.g. Lakshmi Devi"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Location / Zone</label>
                  <input
                    type="text"
                    required
                    value={storyLocation}
                    onChange={e => setStoryLocation(e.target.value)}
                    placeholder="e.g. North Slum Cluster"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Summary Story Narrative</label>
                <textarea
                  required
                  rows={3}
                  value={storySummary}
                  onChange={e => setStorySummary(e.target.value)}
                  placeholder="Describe the struggle, the aid provided, and current situation..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Impact Highlight Text</label>
                <input
                  type="text"
                  required
                  value={storyImpact}
                  onChange={e => setStoryImpact(e.target.value)}
                  placeholder="e.g. 142 nutritious meals provided, ensuring children stayed in school."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={storyImage}
                  onChange={e => setStoryImage(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl mt-2 shadow"
              >
                {editingStoryId ? 'Save Changes' : 'Publish Story to Public Website'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: FAQ */}
      {showFAQModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                {editingFAQId ? 'Edit FAQ Item' : 'Add FAQ Question & Answer'}
              </h3>
              <button onClick={() => setShowFAQModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveFAQ} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={faqQ}
                  onChange={e => setFaqQ(e.target.value)}
                  placeholder="e.g. Why is there a ₹20 minimum donation?"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Detailed Answer</label>
                <textarea
                  required
                  rows={4}
                  value={faqA}
                  onChange={e => setFaqA(e.target.value)}
                  placeholder="Comprehensive, policy-backed explanation..."
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl mt-2"
              >
                {editingFAQId ? 'Update FAQ' : 'Save FAQ to Website'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p className="font-bold text-sm">Loading Seva Admin Command...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
