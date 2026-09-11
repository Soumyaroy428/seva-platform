import {
  UserModel,
  VolunteerModel,
  CampaignModel,
  DonationModel,
  SettingModel,
  SuccessStoryModel,
  AuditLogModel,
  HowItWorksModel,
  FAQModel,
  CommitteeMemberModel,
  ExpenseModel,
  RightHeroCardModel,
  DistributionEventModel
} from '../models';

export interface IRightHeroCard {
  id?: string;
  _id?: string;
  badgeText?: string;
  timeAgo?: string;
  title: string;
  imageUrl?: string;
  raisedAmount?: number;
  goalAmount?: number;
  progressPercentage?: number;
  impactCardTag?: string;
  impactCardText?: string;
  impactCardIcon?: string;
  showImpactCard?: boolean;
  volunteerCardTag?: string;
  volunteerCardText?: string;
  volunteerCardIcon?: string;
  showVolunteerCard?: boolean;
  isActive?: boolean;
  updatedBy?: string;
  updatedAt?: string | Date;
}

export interface IVerifiedMetrics {
  totalMealsServed: number;
  totalPeopleHelped: number;
  activeVolunteersCount: number;
  totalDistributionsCount: number;
  totalDonated: number;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  mealsLabel?: string;
  mealsSublabel?: string;
  peopleLabel?: string;
  peopleSublabel?: string;
  volunteersLabel?: string;
  volunteersSublabel?: string;
  distributionsLabel?: string;
  distributionsSublabel?: string;
  donatedLabel?: string;
  donatedSublabel?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ICampaignSectionSettings {
  isEnabled: boolean;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  minDonationText?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface IDistributionSectionSettings {
  isEnabled: boolean;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  verifiedBadgeText?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface IStorySectionSettings {
  isEnabled: boolean;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  consentBadgeText?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface IHowItWorksStep {
  id: string;
  number: string;
  title: string;
  desc: string;
  badge?: string;
}

export interface IFAQItem {
  id: string;
  q: string;
  a: string;
  category?: string;
}

export interface ICampaign {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  mealsSupported: number;
  donorCount: number;
  coverImage: string;
  location: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  isEmergency?: boolean;
  category: string;
}

export interface IDonation {
  id?: string;
  donationId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  campaignId?: string;
  campaignTitle?: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  isAnonymous?: boolean;
  recurringFrequency?: string;
  collectedBy?: string;
  receiptNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'volunteer' | 'donor';
  volunteerStatus?: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
  volunteerId?: string;
  phone?: string;
  area?: string;
  skills?: string[];
  availability?: string;
  avatar?: string;
  token?: string;
  createdAt: string;
}

export interface ISiteSettings {
  siteTitle: string;
  tagline: string;
  helplinePhone: string;
  minDonationINR: number;
  emergencyBannerEnabled: boolean;
  emergencyBannerBadge?: string;
  emergencyBannerText: string;
  trustTagline?: string;
  bannerTheme?: string;
  totalMealsOffset: number;
  totalPeopleOffset: number;
  activeVolunteersOffset: number;
  targetDonationGoal: number;
}

export interface IPaymentQR {
  id?: string;
  qrId: string;
  title: string;
  upiId: string;
  accountName: string;
  location: string;
  qrImageUrl: string;
  uploadedBy: string;
  status: 'Pending' | 'Active' | 'Rejected' | 'Expired' | 'Disabled';
  createdAt?: string;
}

export interface IFoodDonation {
  id?: string;
  donorName: string;
  donorPhone: string;
  foodType: string;
  quantity: string;
  estimatedServings: number;
  preparedAt: string;
  safeUntil: string;
  dietaryCategory: string;
  packaging: string;
  pickupLocation: string;
  pickupTime: string;
  status: string;
  notes?: string;
}

export interface IVolunteer {
  id?: string;
  volunteerId: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  skills: string[];
  availability: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
  hoursLogged: number;
  tasksCompleted: number;
  joinedDate?: string;
  photo?: string;
}

export interface IBeneficiary {
  id?: string;
  beneficiaryId: string;
  name: string;
  familyHeadName?: string;
  area: string;
  householdSize: number;
  category: string;
  verificationStatus: string;
  qrToken?: string;
  mealsReceived: number;
}

export interface IDistributionEvent {
  id?: string;
  eventId: string;
  campaignTitle: string;
  location: string;
  date: string;
  volunteersAssigned: string[];
  volunteersInvolved?: string[];
  mealsDistributed: number;
  beneficiariesCount: number;
  foodSource?: string;
  proofPhotos: string[];
  proofPhoto?: string;
  status: string;
  notes?: string;
}

export interface IExpense {
  id?: string;
  amount: number;
  category: string;
  campaignTitle: string;
  date: string;
  description: string;
  approvedBy: string;
}

export interface ICommitteeMember {
  id: string;
  name: string;
  designation: string;
  bio: string;
  responsibilities: string;
  photo: string;
}

export interface ISuccessStory {
  id: string;
  title: string;
  beneficiaryName: string;
  location: string;
  summary: string;
  impactText: string;
  image: string;
  date: string;
}

export interface IAuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

class SevaServerStore {
  private campaigns: ICampaign[] = [
    {
      id: 'camp-1',
      title: 'Warm Meals for Slum Children & Families',
      slug: 'warm-meals-slum-children',
      description: 'Providing freshly cooked nutritious meals daily to 800+ children and daily wage workers across suburban settlements.',
      targetAmount: 250000,
      collectedAmount: 184500,
      mealsSupported: 7380,
      donorCount: 420,
      coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
      location: 'North & East Districts, Urban Center',
      status: 'Active',
      category: 'Food Relief',
      isEmergency: false
    },
    {
      id: 'camp-2',
      title: 'Emergency Flood Relief Kitchen 2026',
      slug: 'flood-relief-kitchen-2026',
      description: 'Urgent hot meal packs, bottled water, and baby food packets dispatched via mobile rescue vans to inundated colonies.',
      targetAmount: 500000,
      collectedAmount: 395000,
      mealsSupported: 15800,
      donorCount: 910,
      coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
      location: 'Riverbank Lowlands & Shelter Camps',
      status: 'Active',
      category: 'Disaster',
      isEmergency: true
    },
    {
      id: 'camp-3',
      title: 'Elderly Dignity Food & Ration Kits',
      slug: 'elderly-dignity-ration-kits',
      description: 'Monthly grocery and nutrition packages for abandoned elders and destitute senior citizens unable to cook daily.',
      targetAmount: 180000,
      collectedAmount: 142000,
      mealsSupported: 5680,
      donorCount: 280,
      coverImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?q=80&w=800&auto=format&fit=crop',
      location: 'Old Age Care Units & Rural Outskirts',
      status: 'Active',
      category: 'Community Kitchen',
      isEmergency: false
    },
    {
      id: 'camp-4',
      title: 'Daily Evening Hunger Relief Cart',
      slug: 'hunger-relief-cart',
      description: 'Fresh rotis, dal, and vegetable curry served every evening to rickshaw pullers, hospital attendants, and pavement dwellers.',
      targetAmount: 120000,
      collectedAmount: 98000,
      mealsSupported: 3920,
      donorCount: 195,
      coverImage: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482?q=80&w=800&auto=format&fit=crop',
      location: 'District Railway Station & Civil Hospital',
      status: 'Active',
      category: 'Food Relief',
      isEmergency: false
    }
  ];

  private donations: IDonation[] = [];

  private paymentQRs: IPaymentQR[] = [
    {
      id: 'qr-1',
      qrId: 'QR-SEVA-MAIN',
      title: 'Official Seva Relief Trust Account',
      upiId: 'seva.relief@upi',
      accountName: 'Seva Social Welfare Trust',
      location: 'Central Headquarters',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=seva.relief@upi%26pn=Seva+Trust%26cu=INR',
      uploadedBy: 'Admin (System)',
      status: 'Active',
      createdAt: '2026-08-01T00:00:00Z'
    },
    {
      id: 'qr-2',
      qrId: 'QR-FLOOD-DISPATCH',
      title: 'Flood Kitchen Mobile Van #3',
      upiId: 'seva.emergency@upi',
      accountName: 'Seva Emergency Operations',
      location: 'Riverbank Relief Base Camp',
      qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=seva.emergency@upi%26pn=Seva+Emergency%26cu=INR',
      uploadedBy: 'Aarav Patel (Coordinator)',
      status: 'Active',
      createdAt: '2026-08-22T08:00:00Z'
    }
  ];

  private volunteers: IVolunteer[] = [];

  private users: IUser[] = [];

  private rightHeroCard: IRightHeroCard | null = null;

  private settings: ISiteSettings = {
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
  };

  private verifiedMetrics: IVerifiedMetrics = {
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
    donatedSublabel: 'Starting from ₹20 minimum',
    updatedBy: 'System Admin',
    updatedAt: new Date().toISOString()
  };

  private campaignSectionSettings: ICampaignSectionSettings = {
    isEnabled: true,
    badgeText: 'Active Relief Missions',
    heading: 'Support an Active Campaign',
    subheading: '100% of your funds go directly into verified grocery procurement, kitchen prep, and volunteer field dispatches.',
    minDonationText: 'Minimum Donation: ₹20 INR',
    updatedBy: 'System Admin',
    updatedAt: new Date().toISOString()
  };

  private distributionSectionSettings: IDistributionSectionSettings = {
    isEnabled: true,
    badgeText: 'Field Evidence & Verification',
    heading: 'Recent Ground Distributions',
    subheading: 'Photographs, beneficiary headcounts, and field volunteer logs uploaded directly after every meal distribution.',
    verifiedBadgeText: 'Admin Reviewed & Approved',
    updatedBy: 'System Admin',
    updatedAt: new Date().toISOString()
  };

  private storySectionSettings: IStorySectionSettings = {
    isEnabled: true,
    badgeText: 'Human Impact',
    heading: 'Stories of Hope, Dignity & Survival',
    subheading: 'Behind every ₹20 or ₹500 donated is a living human being whose day was made brighter with food, compassion, and community respect.',
    consentBadgeText: 'Beneficiary Consent Verified',
    updatedBy: 'System Admin',
    updatedAt: new Date().toISOString()
  };

  private beneficiaries: IBeneficiary[] = [
    {
      id: 'ben-1',
      beneficiaryId: 'SEVA-BEN-30491',
      name: 'Lakshmi Devi',
      familyHeadName: 'Lakshmi Devi',
      area: 'Railway Colony Slum, Sector 4',
      householdSize: 5,
      category: 'Daily Wage',
      verificationStatus: 'Verified',
      mealsReceived: 142,
      qrToken: 'BEN-TOKEN-30491'
    }
  ];

  private distributions: IDistributionEvent[] = [
    {
      id: 'dist-1',
      eventId: 'SEVA-DIST-2026-081',
      campaignTitle: 'Emergency Flood Relief Kitchen 2026',
      location: 'Shelter Camp 3, Riverbank Colony',
      date: '2026-09-04',
      volunteersAssigned: ['Amitabh Roy', 'Sneha Banerjee'],
      mealsDistributed: 450,
      beneficiariesCount: 150,
      foodSource: 'Central Seva Relief Kitchen & Partner Bakery',
      proofPhotos: [
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop'
      ],
      status: 'Verified',
      notes: 'Hot khichdi, pickle, and bottled water distributed smoothly. Verified QR cards scanned for 120 families.'
    },
    {
      id: 'dist-2',
      eventId: 'SEVA-DIST-2026-082',
      campaignTitle: 'Warm Meals for Slum Children & Families',
      location: 'Sector 4 Community Shed',
      date: '2026-09-03',
      volunteersAssigned: ['Rohan Deshmukh'],
      mealsDistributed: 320,
      beneficiariesCount: 95,
      foodSource: 'Wedding Surplus Pick-up (The Grand Banquet) + Kitchen Prep',
      proofPhotos: [
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'
      ],
      status: 'Verified',
      notes: 'Inspected under food safety protocol. Consumed within 3 hours of safe deadline.'
    }
  ];

  private foodDonations: IFoodDonation[] = [
    {
      id: 'fd-1',
      donorName: 'Royal Orchid Banquet Hall',
      donorPhone: '+91 98234 54321',
      foodType: 'Cooked Vegetable Biryani, Paneer Gravy, Rotis',
      quantity: '60 kg',
      estimatedServings: 180,
      preparedAt: '2026-09-05T19:00:00Z',
      safeUntil: '2026-09-06T04:00:00Z',
      dietaryCategory: 'Vegetarian',
      packaging: 'Stainless steel sealed containers',
      pickupLocation: 'Royal Orchid, Ring Road, Gate 2',
      pickupTime: '2026-09-05T22:30:00Z',
      status: 'Assigned',
      notes: 'Surplus wedding catering food.'
    }
  ];

  private expenses: IExpense[] = [
    {
      id: 'exp-1',
      amount: 42000,
      category: 'Food Purchases',
      campaignTitle: 'Emergency Flood Relief Kitchen 2026',
      date: '2026-09-02',
      description: 'Bulk purchase of rice (1,200 kg), toor dal (400 kg), and mustard oil from wholesale mandi.',
      approvedBy: 'Managing Trustee (Finance)'
    },
    {
      id: 'exp-2',
      amount: 8500,
      category: 'Transportation',
      campaignTitle: 'Emergency Flood Relief Kitchen 2026',
      date: '2026-09-03',
      description: 'Diesel & vehicle rental for mobile food distribution van navigating flooded access routes.',
      approvedBy: 'Operations Lead'
    }
  ];

  private committee: ICommitteeMember[] = [
    {
      id: 'com-1',
      name: 'Dr. Alok Sen Sharma',
      designation: 'Managing Trustee & President',
      bio: 'Former public health administrator with over 28 years in emergency humanitarian food logistics.',
      responsibilities: 'Governance oversight, ethics board, and public accountability reporting.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 'com-2',
      name: 'Smt. Maitreyi Goswami',
      designation: 'Director of Volunteer Operations',
      bio: 'Social worker and community activist who organized city-wide hunger mitigation task forces across 35 neighborhoods.',
      responsibilities: 'Volunteer vetting, field safety protocols, and volunteer welfare.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop'
    }
  ];

  private stories: ISuccessStory[] = [
    {
      id: 'story-1',
      title: 'From Near Starvation to Hope: Lakshmi’s Family',
      beneficiaryName: 'Lakshmi Devi',
      location: 'North Slum Cluster',
      summary: 'After the sudden illness of her husband, daily wage labor stopped completely. Seva’s verified monthly meal kit provided steady daily nourishment for her 4 children.',
      impactText: '142 nutritious meals provided, ensuring children stayed healthy and in school.',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
      date: '2026-08-28'
    },
    {
      id: 'story-2',
      title: 'Disaster Relief in Action: 3,000 Warm Meals in 48 Hours',
      beneficiaryName: 'Flood Evacuees Shelter',
      location: 'Riverbank Colony Camp',
      summary: 'When flash floods submerged low-lying huts, the Seva Mobile Kitchen Van was on the ground within 3 hours serving boiling hot khichdi and clean water.',
      impactText: '3,200 emergency meal packs delivered without interruption over 5 intense flood days.',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
      date: '2026-08-30'
    }
  ];

  private auditLogs: IAuditLog[] = [
    {
      id: 'log-1',
      user: 'System Admin',
      action: 'QR_APPROVED',
      entity: 'PaymentQR',
      details: 'Approved QR code QR-FLOOD-DISPATCH for mobile flood operations.',
      timestamp: '2026-09-01 11:20:00'
    }
  ];

  private howItWorksSteps: IHowItWorksStep[] = [
    {
      id: 'step-1',
      number: '01',
      title: 'Contribution (≥ ₹20)',
      desc: 'Donor gives via verified UPI QR, Netbanking, or card. Every transaction receives an instant 80G digital receipt.',
      badge: 'Digitally Verified'
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Bulk Kitchen Procurement',
      desc: 'Transparent bulk grocery purchases from wholesale mandis logged publicly in our real-time transparency center.',
      badge: 'Public Mandi Receipts'
    },
    {
      id: 'step-3',
      number: '03',
      title: 'Volunteer Operations',
      desc: 'Approved volunteers with digital ID badges collect fresh food and dispatch mobile hunger relief vans to target slums and disaster zones.',
      badge: 'Tamper-Proof Badges'
    },
    {
      id: 'step-4',
      number: '04',
      title: 'Verified Distribution',
      desc: 'Beneficiaries receive warm meals; ground teams scan QR passes and upload geo-tagged photo proofs reviewed by Admins.',
      badge: 'Geo-Tagged Proof'
    },
    {
      id: 'step-5',
      number: '05',
      title: 'Direct Donor Impact',
      desc: 'Donors receive automated monthly reports detailing exact meals served and communities nourished by their contribution.',
      badge: '100% Traceability'
    }
  ];

  private faqs: IFAQItem[] = [
    {
      id: 'faq-1',
      q: 'Why is there a minimum donation rule of ₹20?',
      a: 'In accordance with our PRD governance rules, ₹20 is the exact real-world cost of procuring wholesome raw staples (rice, lentils, spices) to cook 1 nutritious hot meal for a person in need. Any smaller transaction is eroded by banking/gateway payment interchange fees. Setting ₹20 as our hard floor ensures that 100% of the funds create tangible meals without payment waste.',
      category: 'Donations'
    },
    {
      id: 'faq-2',
      q: 'How does Seva ensure payment QR codes are authentic?',
      a: 'Under our strict Anti-Fraud protocol, any QR uploaded by a field volunteer or regional coordinator is held in "Pending" status and is completely hidden from donors. An Administrator must audit the UPI ID, bank account name, and operational authorization before approving it. Only verified active QRs appear on the public donation page.',
      category: 'Security'
    },
    {
      id: 'faq-3',
      q: 'Can I claim tax deduction under Section 80G?',
      a: 'Yes. Every donation made on Seva automatically generates an official 80G-compliant digital receipt with a unique ID (e.g., SEVA-DON-2026-000123), organization trust registration number, and donor details, which you can immediately download or print for tax filing.',
      category: 'Tax Benefits'
    },
    {
      id: 'faq-4',
      q: 'How is surplus food checked for safety before distribution?',
      a: 'We strictly follow FSSAI temperature and sensory hygiene protocols. We only accept freshly cooked food with at least 4-6 hours of remaining shelf life. Food past its safe consumption deadline is automatically marked unavailable by our safety engine to prevent foodborne illness.',
      category: 'Food Safety'
    },
    {
      id: 'faq-5',
      q: 'How do volunteers receive their official Digital ID badge?',
      a: 'When an individual registers as a volunteer, their profile is vetted by our operations desk. Once approved by an Admin, the volunteer receives a tamper-proof Digital Volunteer ID badge with a unique QR code (SEVA-VOL-XXXX) that can be verified on-site during ground distributions.',
      category: 'Volunteers'
    },
    {
      id: 'faq-6',
      q: 'Can I donate anonymously?',
      a: 'Yes. When donating, you can simply toggle the "Donate anonymously" checkbox. Your name will be hidden from the public donor roll and community feeds, while your 80G receipt is still securely emailed to you.',
      category: 'Privacy'
    }
  ];

  private otps: Map<string, { identifier: string; code: string; expiresAt: number; intent: 'login' | 'register'; registerData?: any }> = new Map();

  // Accessors
  getCampaigns() { return this.campaigns; }
  createCampaign(data: any) {
    const newCamp: ICampaign = {
      ...data,
      id: `camp-${Date.now()}`,
      collectedAmount: 0,
      mealsSupported: 0,
      donorCount: 0
    };
    this.campaigns.unshift(newCamp);
    this.logAudit('System Admin', 'CAMPAIGN_CREATED', 'Campaign', `Created campaign: ${newCamp.title}`);
    CampaignModel.create(newCamp).catch((err: any) => console.warn('⚠️ MongoDB Atlas Campaign save error:', err.message));
    return newCamp;
  }

  updateCampaign(id: string, data: Partial<ICampaign>) {
    const idx = this.campaigns.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    this.campaigns[idx] = { ...this.campaigns[idx], ...data };
    this.logAudit('System Admin', 'CAMPAIGN_UPDATED', 'Campaign', `Updated campaign: ${this.campaigns[idx].title}`);
    CampaignModel.updateOne(
      { $or: [{ id }, { slug: id }] },
      { $set: data }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Campaign update error:', err.message));
    return this.campaigns[idx];
  }

  deleteCampaign(id: string) {
    const idx = this.campaigns.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return false;
    const removed = this.campaigns.splice(idx, 1);
    this.logAudit('System Admin', 'CAMPAIGN_DELETED', 'Campaign', `Deleted campaign: ${removed[0]?.title}`);
    CampaignModel.deleteOne({ $or: [{ id }, { slug: id }] }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Campaign delete error:', err.message));
    return true;
  }

  // Campaign Section (Support an Active Campaign) Settings
  getCampaignSectionSettings(): ICampaignSectionSettings {
    return this.campaignSectionSettings;
  }

  async updateCampaignSectionSettings(data: Partial<ICampaignSectionSettings>, reviewer: string = 'System Admin'): Promise<ICampaignSectionSettings> {
    this.campaignSectionSettings = {
      ...this.campaignSectionSettings,
      ...(data.isEnabled !== undefined && { isEnabled: Boolean(data.isEnabled) }),
      ...(data.badgeText !== undefined && { badgeText: data.badgeText.trim() }),
      ...(data.heading !== undefined && { heading: data.heading.trim() }),
      ...(data.subheading !== undefined && { subheading: data.subheading.trim() }),
      ...(data.minDonationText !== undefined && { minDonationText: data.minDonationText.trim() }),
      updatedBy: reviewer,
      updatedAt: new Date().toISOString()
    };

    this.logAudit(reviewer, 'CAMPAIGN_SECTION_SETTINGS_UPDATED', 'CampaignSection', `Updated Support an Active Campaign settings. Enabled: ${this.campaignSectionSettings.isEnabled}`);

    SettingModel.findOneAndUpdate(
      { key: 'campaign_section_settings' },
      { key: 'campaign_section_settings', value: this.campaignSectionSettings },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Campaign Section Settings save error:', err.message));

    return this.campaignSectionSettings;
  }

  async clearAllCampaigns(reviewer: string = 'System Admin') {
    const prevCount = this.campaigns.length;
    this.campaigns = [];
    this.logAudit(reviewer, 'ALL_CAMPAIGNS_CLEARED', 'Campaign', `Admin cleared all ${prevCount} campaigns. Section auto-hidden from main website.`);
    try {
      await CampaignModel.deleteMany({});
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas clear campaigns error:', err.message);
    }
    return true;
  }

  async loadSampleCampaigns(reviewer: string = 'System Admin') {
    const sampleCampaigns: ICampaign[] = [
      {
        id: 'camp-1',
        title: 'Warm Meals for Slum Children & Families',
        slug: 'warm-meals-slum-children',
        description: 'Providing freshly cooked nutritious meals daily to 800+ children and daily wage workers across suburban settlements.',
        targetAmount: 250000,
        collectedAmount: 184500,
        mealsSupported: 7380,
        donorCount: 420,
        coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
        location: 'North & East Districts, Urban Center',
        status: 'Active',
        category: 'Food Relief',
        isEmergency: false
      },
      {
        id: 'camp-2',
        title: 'Emergency Flood Relief Kitchen 2026',
        slug: 'flood-relief-kitchen-2026',
        description: 'Urgent hot meal packs, bottled water, and baby food packets dispatched via mobile rescue vans to inundated colonies.',
        targetAmount: 500000,
        collectedAmount: 395000,
        mealsSupported: 15800,
        donorCount: 910,
        coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
        location: 'Riverbank Lowlands & Shelter Camps',
        status: 'Active',
        category: 'Disaster',
        isEmergency: true
      },
      {
        id: 'camp-3',
        title: 'Elderly Dignity Food & Ration Kits',
        slug: 'elderly-dignity-ration-kits',
        description: 'Monthly grocery and nutrition packages for abandoned elders and destitute senior citizens unable to cook daily.',
        targetAmount: 180000,
        collectedAmount: 142000,
        mealsSupported: 5680,
        donorCount: 280,
        coverImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?q=80&w=800&auto=format&fit=crop',
        location: 'Old Age Care Units & Rural Outskirts',
        status: 'Active',
        category: 'Community Kitchen',
        isEmergency: false
      },
      {
        id: 'camp-4',
        title: 'Daily Evening Hunger Relief Cart',
        slug: 'hunger-relief-cart',
        description: 'Fresh rotis, dal, and vegetable curry served every evening to rickshaw pullers, hospital attendants, and pavement dwellers.',
        targetAmount: 120000,
        collectedAmount: 98000,
        mealsSupported: 3920,
        donorCount: 195,
        coverImage: 'https://images.unsplash.com/photo-1541802645635-11f2286a7482?q=80&w=800&auto=format&fit=crop',
        location: 'District Railway Station & Civil Hospital',
        status: 'Active',
        category: 'Food Relief',
        isEmergency: false
      }
    ];

    this.campaigns = sampleCampaigns;
    this.logAudit(reviewer, 'SAMPLE_CAMPAIGNS_LOADED', 'Campaign', 'Admin loaded 4 verified baseline sample campaigns');
    try {
      await CampaignModel.deleteMany({});
      await CampaignModel.insertMany(sampleCampaigns);
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas load sample campaigns error:', err.message);
    }
    return this.campaigns;
  }

  getDonations() { return this.donations; }
  createDonation(data: any) {
    if (data.amount < 20) {
      throw new Error('Minimum donation amount is ₹20. Smaller amounts cannot be processed.');
    }
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const donationId = `SEVA-DON-${year}-${randomNum}`;
    const newDonation: IDonation = {
      ...data,
      id: `don-${Date.now()}`,
      donationId,
      status: 'Successful',
      createdAt: new Date().toISOString()
    };
    this.donations.unshift(newDonation);
    this.logAudit(data.donorEmail, 'DONATION_SUCCESS', 'Donation', `Processed ₹${data.amount} (ID: ${donationId})`);

    // Asynchronously persist to MongoDB Atlas
    DonationModel.create({
      id: newDonation.id,
      donationId: newDonation.donationId,
      donorName: newDonation.donorName,
      donorEmail: newDonation.donorEmail,
      donorPhone: newDonation.donorPhone,
      amount: newDonation.amount,
      campaignId: newDonation.campaignId,
      campaignTitle: newDonation.campaignTitle,
      paymentMethod: newDonation.paymentMethod || 'UPI',
      status: newDonation.status,
      transactionId: newDonation.transactionId,
      isAnonymous: newDonation.isAnonymous,
      recurringFrequency: newDonation.recurringFrequency,
      collectedBy: newDonation.collectedBy,
      receiptNote: newDonation.receiptNote,
      verifiedBy: newDonation.verifiedBy,
      verifiedAt: newDonation.verifiedAt
    }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Donation save error:', err.message));

    return newDonation;
  }

  getPaymentQRs() { return this.paymentQRs; }
  getActivePaymentQRs() { return this.paymentQRs.filter(q => q.status === 'Active'); }
  addPaymentQR(data: any) {
    const newQR: IPaymentQR = {
      ...data,
      id: `qr-${Date.now()}`,
      qrId: `QR-UPLOAD-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.paymentQRs.push(newQR);
    this.logAudit(data.uploadedBy, 'QR_UPLOADED', 'PaymentQR', `Submitted QR ${newQR.title} for review`);
    return newQR;
  }
  approvePaymentQR(qrId: string, reviewer: string) {
    const q = this.paymentQRs.find(qr => qr.id === qrId || qr.qrId === qrId);
    if (q) {
      q.status = 'Active';
      this.logAudit(reviewer, 'QR_APPROVED', 'PaymentQR', `Approved QR ${q.qrId}`);
      return true;
    }
    return false;
  }
  rejectPaymentQR(qrId: string, reviewer: string) {
    const q = this.paymentQRs.find(qr => qr.id === qrId || qr.qrId === qrId);
    if (q) {
      q.status = 'Rejected';
      this.logAudit(reviewer, 'QR_REJECTED', 'PaymentQR', `Rejected QR ${q.qrId}`);
      return true;
    }
    return false;
  }

  getVolunteers() { return this.volunteers; }
  registerVolunteer(data: any) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newVol: IVolunteer = {
      ...data,
      id: `vol-${Date.now()}`,
      volunteerId: `SEVA-VOL-${randomCode}`,
      status: 'Pending',
      hoursLogged: 0,
      tasksCompleted: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    this.volunteers.push(newVol);
    this.logAudit(data.email, 'VOLUNTEER_REGISTERED', 'Volunteer', `New volunteer: ${data.name}`);
    return newVol;
  }
  updateVolunteerStatus(id: string, status: any, reviewer: string) {
    const v = this.volunteers.find(vol => vol.id === id || vol.volunteerId === id);
    if (v) {
      if (status === 'Approved' && v.status !== 'Approved') {
        const approvedCount = this.volunteers.filter(vol => vol.status === 'Approved').length;
        if (approvedCount >= 4) {
          throw new Error('Maximum approved volunteer limit reached. Exactly 4 active volunteers are permitted on the platform.');
        }
      }

      v.status = status;
      const user = this.users.find(u => (u.volunteerId && u.volunteerId === v.volunteerId) || u.email.toLowerCase() === v.email.toLowerCase());
      if (user) {
        user.volunteerStatus = status;
      }
      this.logAudit(reviewer, 'VOLUNTEER_STATUS_UPDATED', 'Volunteer', `Updated ${v.volunteerId} (${v.name}) status to ${status}`);

      // Persist to MongoDB Atlas
      VolunteerModel.updateOne(
        { volunteerId: v.volunteerId },
        { $set: { status } }
      ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Volunteer status update error:', err.message));

      UserModel.updateOne(
        { $or: [{ volunteerId: v.volunteerId }, { email: v.email.toLowerCase() }] },
        { $set: { volunteerStatus: status } }
      ).catch((err: any) => console.warn('⚠️ MongoDB Atlas User volunteerStatus update error:', err.message));

      return true;
    }
    return false;
  }

  deleteVolunteer(id: string, reviewer: string = 'System Admin') {
    const idx = this.volunteers.findIndex(vol => vol.id === id || vol.volunteerId === id);
    if (idx === -1) return false;
    const removed = this.volunteers.splice(idx, 1);
    this.logAudit(reviewer, 'VOLUNTEER_REMOVED', 'Volunteer', `Removed volunteer ${removed[0]?.volunteerId}`);
    VolunteerModel.deleteOne({ $or: [{ id }, { volunteerId: id }] }).catch((err: any) => console.warn('MongoDB Atlas Volunteer delete error:', err.message));
    return true;
  }

  // Hand cash collection recorded by volunteer
  createCashDonation(data: {
    donorName: string;
    donorPhone?: string;
    donorEmail?: string;
    amount: number;
    campaignId?: string;
    campaignTitle?: string;
    receiptNote?: string;
    collectedBy: string;
    date?: string;
  }) {
    if (data.amount < 20) {
      throw new Error('Minimum donation amount is ₹20. Smaller amounts cannot be processed.');
    }
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const donationId = `SEVA-DON-${year}-${randomNum}`;

    const newDonation: IDonation = {
      id: `don-${Date.now()}`,
      donationId,
      donorName: data.donorName,
      donorEmail: data.donorEmail || `${data.donorName.toLowerCase().replace(/[^a-z0-9]/g, '.') || 'cash.donor'}@offline.donations`,
      donorPhone: data.donorPhone || '',
      amount: data.amount,
      campaignId: data.campaignId,
      campaignTitle: data.campaignTitle || 'General Hunger Relief & Kitchen Support',
      paymentMethod: 'Cash',
      status: 'Verified',
      transactionId: `HANDCASH-${Date.now().toString().slice(-6)}`,
      collectedBy: data.collectedBy,
      receiptNote: data.receiptNote || 'Manual hand cash received on ground',
      verifiedBy: data.collectedBy,
      verifiedAt: new Date().toISOString(),
      createdAt: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    };

    this.donations.unshift(newDonation);

    if (data.campaignId || data.campaignTitle) {
      const camp = this.campaigns.find(c => c.id === data.campaignId || c.title === data.campaignTitle);
      if (camp) {
        camp.collectedAmount += data.amount;
        camp.mealsSupported += Math.floor(data.amount / 25);
        camp.donorCount += 1;
      }
    }

    this.logAudit(data.collectedBy, 'HAND_CASH_COLLECTED', 'Donation', `Collected ₹${data.amount} hand cash from ${data.donorName} (${donationId})`);

    // Persist cash donation to MongoDB Atlas
    DonationModel.create({
      id: newDonation.id,
      donationId: newDonation.donationId,
      donorName: newDonation.donorName,
      donorEmail: newDonation.donorEmail,
      donorPhone: newDonation.donorPhone,
      amount: newDonation.amount,
      campaignId: newDonation.campaignId,
      campaignTitle: newDonation.campaignTitle,
      paymentMethod: 'Cash',
      status: 'Verified',
      transactionId: newDonation.transactionId,
      isAnonymous: false,
      collectedBy: newDonation.collectedBy,
      receiptNote: newDonation.receiptNote,
      verifiedBy: newDonation.verifiedBy,
      verifiedAt: new Date()
    }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Cash Donation save error:', err.message));

    if (data.campaignId || data.campaignTitle) {
      CampaignModel.updateOne(
        { $or: [{ id: data.campaignId }, { slug: data.campaignId }, { title: data.campaignTitle }] },
        { $inc: { collectedAmount: data.amount, mealsSupported: Math.floor(data.amount / 25), donorCount: 1 } }
      ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Campaign update error:', err.message));
    }

    return newDonation;
  }

  // Update existing donation (status, verification, notes)
  updateDonation(id: string, updates: { status?: string; receiptNote?: string }, reviewer: string) {
    const don = this.donations.find(d => d.id === id || d.donationId === id);
    if (!don) return null;
    if (updates.status) don.status = updates.status;
    if (updates.receiptNote !== undefined) don.receiptNote = updates.receiptNote;
    don.verifiedBy = reviewer;
    don.verifiedAt = new Date().toISOString();
    this.logAudit(reviewer, 'DONATION_UPDATED', 'Donation', `Updated donation ${don.donationId} status to ${updates.status || 'Verified'}`);

    // Persist to MongoDB Atlas
    DonationModel.updateOne(
      { $or: [{ id: don.id }, { donationId: don.donationId }] },
      { $set: { status: don.status, receiptNote: don.receiptNote, verifiedBy: don.verifiedBy, verifiedAt: new Date() } }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Donation update error:', err.message));

    return don;
  }

  getBeneficiaries() { return this.beneficiaries; }
  registerBeneficiary(data: any) {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const newBen: IBeneficiary = {
      ...data,
      id: `ben-${Date.now()}`,
      beneficiaryId: `SEVA-BEN-${randomCode}`,
      verificationStatus: 'Verified',
      mealsReceived: 0,
      qrToken: `BEN-TOKEN-${randomCode}`
    };
    this.beneficiaries.push(newBen);
    this.logAudit('staff@seva.org', 'BENEFICIARY_ENROLLED', 'Beneficiary', `Enrolled ${data.name}`);
    return newBen;
  }

  getDistributions() { return this.distributions; }

  createDistribution(data: any, reviewer: string = 'System Admin') {
    const year = new Date().getFullYear();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const newDist: IDistributionEvent = {
      id: `dist-${Date.now()}`,
      eventId: data.eventId || `SEVA-DIST-${year}-${randomCode}`,
      campaignTitle: data.campaignTitle || 'General Hunger Relief',
      location: data.location || 'Central Outreach Area',
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      volunteersAssigned: Array.isArray(data.volunteersAssigned)
        ? data.volunteersAssigned
        : (typeof data.volunteersAssigned === 'string'
          ? data.volunteersAssigned.split(',').map((s: string) => s.trim()).filter(Boolean)
          : ['Field Volunteer']),
      mealsDistributed: Number(data.mealsDistributed) || 0,
      beneficiariesCount: Number(data.beneficiariesCount) || Math.floor((Number(data.mealsDistributed) || 0) / 3),
      foodSource: data.foodSource || 'Seva Relief Kitchen',
      proofPhotos: Array.isArray(data.proofPhotos) && data.proofPhotos.length > 0
        ? data.proofPhotos
        : (typeof data.proofPhotos === 'string' && data.proofPhotos.trim() !== ''
          ? data.proofPhotos.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : ['https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop']),
      status: data.status || 'Verified',
      notes: data.notes || ''
    };
    this.distributions.unshift(newDist);
    this.logAudit(reviewer, 'DISTRIBUTION_RECORDED', 'DistributionEvent', `Recorded ${newDist.mealsDistributed} meals at ${newDist.location} (${newDist.eventId})`);

    // Persist to MongoDB Atlas
    DistributionEventModel.create({
      eventId: newDist.eventId,
      campaignTitle: newDist.campaignTitle,
      location: newDist.location,
      date: new Date(newDist.date),
      volunteersAssigned: newDist.volunteersAssigned,
      mealsDistributed: newDist.mealsDistributed,
      beneficiariesCount: newDist.beneficiariesCount,
      foodSource: newDist.foodSource,
      proofPhotos: newDist.proofPhotos,
      status: newDist.status,
      notes: newDist.notes
    }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Distribution save error:', err.message));

    return newDist;
  }

  updateDistribution(id: string, data: any, reviewer: string = 'System Admin') {
    const idx = this.distributions.findIndex(d => d.id === id || d.eventId === id);
    if (idx === -1) return null;
    const current = this.distributions[idx];
    const updated: IDistributionEvent = {
      ...current,
      ...data,
      campaignTitle: data.campaignTitle !== undefined ? data.campaignTitle : current.campaignTitle,
      location: data.location !== undefined ? data.location : current.location,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : current.date,
      mealsDistributed: data.mealsDistributed !== undefined ? Number(data.mealsDistributed) : current.mealsDistributed,
      beneficiariesCount: data.beneficiariesCount !== undefined ? Number(data.beneficiariesCount) : current.beneficiariesCount,
      foodSource: data.foodSource !== undefined ? data.foodSource : current.foodSource,
      volunteersAssigned: Array.isArray(data.volunteersAssigned)
        ? data.volunteersAssigned
        : (typeof data.volunteersAssigned === 'string'
          ? data.volunteersAssigned.split(',').map((s: string) => s.trim()).filter(Boolean)
          : current.volunteersAssigned),
      proofPhotos: Array.isArray(data.proofPhotos)
        ? data.proofPhotos
        : (typeof data.proofPhotos === 'string' && data.proofPhotos.trim() !== ''
          ? data.proofPhotos.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : current.proofPhotos),
      status: data.status !== undefined ? data.status : current.status,
      notes: data.notes !== undefined ? data.notes : current.notes
    };
    this.distributions[idx] = updated;
    this.logAudit(reviewer, 'DISTRIBUTION_UPDATED', 'DistributionEvent', `Updated distribution ${updated.eventId} (${updated.campaignTitle})`);

    // Persist to MongoDB Atlas
    DistributionEventModel.updateOne(
      { $or: [{ eventId: current.eventId }, { _id: current.id }] },
      {
        $set: {
          campaignTitle: updated.campaignTitle,
          location: updated.location,
          date: new Date(updated.date),
          volunteersAssigned: updated.volunteersAssigned,
          mealsDistributed: updated.mealsDistributed,
          beneficiariesCount: updated.beneficiariesCount,
          foodSource: updated.foodSource,
          proofPhotos: updated.proofPhotos,
          status: updated.status,
          notes: updated.notes
        }
      }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Distribution update error:', err.message));

    return updated;
  }

  deleteDistribution(id: string, reviewer: string = 'System Admin') {
    const idx = this.distributions.findIndex(d => d.id === id || d.eventId === id);
    if (idx === -1) return false;
    const removed = this.distributions.splice(idx, 1)[0];
    this.logAudit(reviewer, 'DISTRIBUTION_DELETED', 'DistributionEvent', `Deleted distribution ${removed.eventId} (${removed.campaignTitle})`);

    DistributionEventModel.deleteOne({ $or: [{ eventId: removed.eventId }, { _id: removed.id }] })
      .catch((err: any) => console.warn('⚠️ MongoDB Atlas Distribution delete error:', err.message));

    return true;
  }

  async clearAllDistributions(reviewer: string = 'System Admin') {
    this.distributions = [];
    this.logAudit(reviewer, 'ALL_DISTRIBUTIONS_CLEARED', 'DistributionEvent', 'Cleared all ground distribution events from platform');

    try {
      await DistributionEventModel.deleteMany({});
      await SettingModel.findOneAndUpdate(
        { key: 'distributions_initialized' },
        { key: 'distributions_initialized', value: true },
        { upsert: true }
      );
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas Distribution clear error:', err.message);
    }

    return true;
  }

  async loadSampleDistributions(reviewer: string = 'System Admin') {
    const samples: IDistributionEvent[] = [
      {
        id: 'dist-1',
        eventId: 'SEVA-DIST-2026-081',
        campaignTitle: 'Emergency Flood Relief Kitchen 2026',
        location: 'Shelter Camp 3, Riverbank Colony',
        date: '2026-09-04',
        volunteersAssigned: ['Amitabh Roy', 'Sneha Banerjee'],
        mealsDistributed: 450,
        beneficiariesCount: 150,
        foodSource: 'Central Seva Relief Kitchen & Partner Bakery',
        proofPhotos: [
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop'
        ],
        status: 'Verified',
        notes: 'Hot khichdi, pickle, and bottled water distributed smoothly. Verified QR cards scanned for 120 families.'
      },
      {
        id: 'dist-2',
        eventId: 'SEVA-DIST-2026-082',
        campaignTitle: 'Warm Meals for Slum Children & Families',
        location: 'Sector 4 Community Shed',
        date: '2026-09-03',
        volunteersAssigned: ['Rohan Deshmukh'],
        mealsDistributed: 320,
        beneficiariesCount: 95,
        foodSource: 'Wedding Surplus Pick-up (The Grand Banquet) + Kitchen Prep',
        proofPhotos: [
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'
        ],
        status: 'Verified',
        notes: 'Inspected under food safety protocol. Consumed within 3 hours of safe deadline.'
      }
    ];

    this.distributions = samples;
    this.distributionSectionSettings.isEnabled = true;
    this.logAudit(reviewer, 'SAMPLE_DISTRIBUTIONS_LOADED', 'DistributionEvent', 'Restored default sample ground distribution events');

    try {
      await DistributionEventModel.deleteMany({});
      await DistributionEventModel.insertMany(samples.map(d => ({
        eventId: d.eventId,
        campaignTitle: d.campaignTitle,
        location: d.location,
        date: new Date(d.date),
        volunteersAssigned: d.volunteersAssigned,
        mealsDistributed: d.mealsDistributed,
        beneficiariesCount: d.beneficiariesCount,
        foodSource: d.foodSource,
        proofPhotos: d.proofPhotos,
        status: d.status,
        notes: d.notes
      })));
      await SettingModel.findOneAndUpdate(
        { key: 'distributions_initialized' },
        { key: 'distributions_initialized', value: true },
        { upsert: true }
      );
      await SettingModel.findOneAndUpdate(
        { key: 'distribution_section_settings' },
        { key: 'distribution_section_settings', value: this.distributionSectionSettings },
        { upsert: true }
      );
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas Distribution sample seed error:', err.message);
    }

    return this.distributions;
  }

  getDistributionSectionSettings(): IDistributionSectionSettings {
    return this.distributionSectionSettings;
  }

  async updateDistributionSectionSettings(data: Partial<IDistributionSectionSettings>, reviewer: string = 'System Admin'): Promise<IDistributionSectionSettings> {
    const updated: IDistributionSectionSettings = {
      ...this.distributionSectionSettings,
      isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : this.distributionSectionSettings.isEnabled,
      badgeText: (data.badgeText !== undefined && data.badgeText.trim() !== '') ? data.badgeText.trim() : (this.distributionSectionSettings.badgeText || 'Field Evidence & Verification'),
      heading: (data.heading !== undefined && data.heading.trim() !== '') ? data.heading.trim() : (this.distributionSectionSettings.heading || 'Recent Ground Distributions'),
      subheading: (data.subheading !== undefined && data.subheading.trim() !== '') ? data.subheading.trim() : (this.distributionSectionSettings.subheading || 'Photographs, beneficiary headcounts, and field volunteer logs uploaded directly after every meal distribution.'),
      verifiedBadgeText: (data.verifiedBadgeText !== undefined && data.verifiedBadgeText.trim() !== '') ? data.verifiedBadgeText.trim() : (this.distributionSectionSettings.verifiedBadgeText || 'Admin Reviewed & Approved'),
      updatedBy: reviewer,
      updatedAt: new Date().toISOString()
    };

    this.distributionSectionSettings = updated;
    this.logAudit(reviewer, 'DISTRIBUTION_SECTION_SETTINGS_UPDATED', 'DistributionSectionSettings', `Admin updated distribution section settings: isEnabled=${updated.isEnabled}, heading="${updated.heading}"`);

    SettingModel.findOneAndUpdate(
      { key: 'distribution_section_settings' },
      { key: 'distribution_section_settings', value: this.distributionSectionSettings },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Distribution Section Settings save error:', err.message));

    return this.distributionSectionSettings;
  }

  getFoodDonations() { return this.foodDonations; }
  createFoodDonation(data: any) {
    const newFD: IFoodDonation = {
      ...data,
      id: `fd-${Date.now()}`,
      status: 'Pending'
    };
    this.foodDonations.unshift(newFD);
    this.logAudit(data.donorName, 'FOOD_DONATION_SUBMITTED', 'FoodDonation', `Submitted ${data.estimatedServings} servings`);
    return newFD;
  }

  updateFoodDonationStatus(id: string, status: string, notes?: string) {
    const idx = this.foodDonations.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.foodDonations[idx].status = status;
    if (notes !== undefined) this.foodDonations[idx].notes = notes;
    this.logAudit('System Admin', 'FOOD_DONATION_STATUS_UPDATED', 'FoodDonation', `Updated food rescue ${id} status to ${status}`);
    return this.foodDonations[idx];
  }

  getExpenses() { return this.expenses; }
  addExpense(data: any) {
    const newExp: IExpense = {
      ...data,
      id: `exp-${Date.now()}`
    };
    this.expenses.unshift(newExp);
    this.logAudit(data.approvedBy, 'EXPENSE_LOGGED', 'Expense', `Logged ₹${data.amount} for ${data.category}`);
    ExpenseModel.create(newExp).catch((err: any) => console.warn('⚠️ MongoDB Atlas Expense save error:', err.message));
    return newExp;
  }

  updateExpense(id: string, data: Partial<IExpense>) {
    const idx = this.expenses.findIndex(e => e.id === id || (e as any).expenseId === id);
    if (idx === -1) return null;
    this.expenses[idx] = { ...this.expenses[idx], ...data };
    this.logAudit('System Admin', 'EXPENSE_UPDATED', 'Expense', `Updated expense: ₹${this.expenses[idx].amount} for ${this.expenses[idx].category}`);
    ExpenseModel.updateOne(
      { $or: [{ id }, { expenseId: id }] },
      { $set: data }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Expense update error:', err.message));
    return this.expenses[idx];
  }

  deleteExpense(id: string) {
    const idx = this.expenses.findIndex(e => e.id === id || (e as any).expenseId === id);
    if (idx === -1) return false;
    const removed = this.expenses.splice(idx, 1);
    this.logAudit('System Admin', 'EXPENSE_DELETED', 'Expense', `Deleted expense: ₹${removed[0]?.amount}`);
    ExpenseModel.deleteOne({ $or: [{ id }, { expenseId: id }] }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Expense delete error:', err.message));
    return true;
  }

  getCommittee() { return this.committee; }
  addCommitteeMember(data: { name: string; designation: string; bio: string; responsibilities: string; photo?: string }) {
    const newMember: ICommitteeMember = {
      id: `com-${Date.now()}`,
      name: data.name,
      designation: data.designation,
      bio: data.bio,
      responsibilities: data.responsibilities,
      photo: data.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
    };
    this.committee.push(newMember);
    this.logAudit('System Admin', 'COMMITTEE_ADDED', 'CommitteeMember', `Added committee member: ${newMember.name}`);
    CommitteeMemberModel.create(newMember).catch((err: any) => console.warn('⚠️ MongoDB Atlas Committee save error:', err.message));
    return newMember;
  }

  updateCommitteeMember(id: string, data: Partial<ICommitteeMember>) {
    const idx = this.committee.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.committee[idx] = { ...this.committee[idx], ...data };
    this.logAudit('System Admin', 'COMMITTEE_UPDATED', 'CommitteeMember', `Updated member: ${this.committee[idx].name}`);
    CommitteeMemberModel.updateOne({ id }, { $set: data }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Committee update error:', err.message));
    return this.committee[idx];
  }

  deleteCommitteeMember(id: string) {
    const idx = this.committee.findIndex(m => m.id === id);
    if (idx === -1) return false;
    const removed = this.committee.splice(idx, 1);
    this.logAudit('System Admin', 'COMMITTEE_DELETED', 'CommitteeMember', `Removed committee member: ${removed[0]?.name}`);
    CommitteeMemberModel.deleteOne({ id }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Committee delete error:', err.message));
    return true;
  }

  // Blog & Stories CRUD
  getStories() { return this.stories; }
  createStory(data: any) {
    const newStory: ISuccessStory = {
      id: `story-${Date.now()}`,
      title: data.title,
      beneficiaryName: data.beneficiaryName || 'Community Member',
      location: data.location || 'Local Outreach Center',
      summary: data.summary,
      impactText: data.impactText || 'Relief assistance provided.',
      image: data.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
      date: data.date || new Date().toISOString().split('T')[0]
    };
    this.stories.unshift(newStory);
    this.logAudit('System Admin', 'STORY_CREATED', 'SuccessStory', `Published blog/story: ${newStory.title}`);

    // Persist to MongoDB Atlas
    SuccessStoryModel.create({
      id: newStory.id,
      title: newStory.title,
      beneficiaryName: newStory.beneficiaryName,
      location: newStory.location,
      summary: newStory.summary,
      impactText: newStory.impactText,
      image: newStory.image,
      date: newStory.date
    }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Story save error:', err.message));

    return newStory;
  }

  updateStory(id: string, data: any) {
    const idx = this.stories.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.stories[idx] = { ...this.stories[idx], ...data };
    this.logAudit('System Admin', 'STORY_UPDATED', 'SuccessStory', `Updated blog/story: ${this.stories[idx].title}`);

    // Persist to MongoDB Atlas
    SuccessStoryModel.updateOne(
      { id },
      { $set: data }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Story update error:', err.message));

    return this.stories[idx];
  }

  deleteStory(id: string) {
    const idx = this.stories.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const removed = this.stories.splice(idx, 1);
    this.logAudit('System Admin', 'STORY_DELETED', 'SuccessStory', `Deleted blog/story: ${removed[0]?.title}`);

    // Persist to MongoDB Atlas
    SuccessStoryModel.deleteOne({ id }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Story delete error:', err.message));

    return true;
  }

  getStorySectionSettings(): IStorySectionSettings {
    return this.storySectionSettings;
  }

  async updateStorySectionSettings(data: Partial<IStorySectionSettings>, reviewer: string = 'System Admin'): Promise<IStorySectionSettings> {
    const updated: IStorySectionSettings = {
      ...this.storySectionSettings,
      ...data,
      updatedBy: reviewer,
      updatedAt: new Date().toISOString()
    };
    this.storySectionSettings = updated;
    this.logAudit(reviewer, 'STORY_SETTINGS_UPDATED', 'Setting', `Updated stories section settings: isEnabled=${updated.isEnabled}`);

    // Persist to MongoDB Atlas
    SettingModel.findOneAndUpdate(
      { key: 'story_section_settings' },
      { key: 'story_section_settings', value: updated, updatedAt: new Date() },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Story Settings save error:', err.message));

    return updated;
  }

  clearAllStories(reviewer: string = 'System Admin'): boolean {
    const count = this.stories.length;
    this.stories = [];
    this.logAudit(reviewer, 'STORIES_CLEARED_ALL', 'SuccessStory', `Admin cleared all stories (${count} removed). Section div removed from main website.`);

    // Persist removal to MongoDB Atlas
    SuccessStoryModel.deleteMany({}).catch((err: any) => console.warn('⚠️ MongoDB Atlas Stories deleteMany error:', err.message));

    // Also mark stories_initialized as true so it does not auto-seed on reboot
    SettingModel.findOneAndUpdate(
      { key: 'stories_initialized' },
      { key: 'stories_initialized', value: true, updatedAt: new Date() },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Setting save error:', err.message));

    return true;
  }

  loadSampleStories(reviewer: string = 'System Admin'): ISuccessStory[] {
    const sampleStories: ISuccessStory[] = [
      {
        id: 'story-1',
        title: 'From Near Starvation to Hope: Lakshmi’s Family',
        beneficiaryName: 'Lakshmi Devi',
        location: 'North Slum Cluster',
        summary: 'After the sudden illness of her husband, daily wage labor stopped completely. Seva’s verified monthly meal kit provided steady daily nourishment for her 4 children.',
        impactText: '142 nutritious meals provided, ensuring children stayed healthy and in school.',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
        date: '2026-08-28'
      },
      {
        id: 'story-2',
        title: 'Disaster Relief in Action: 3,000 Warm Meals in 48 Hours',
        beneficiaryName: 'Flood Evacuees Shelter',
        location: 'Riverbank Colony Camp',
        summary: 'When flash floods submerged low-lying huts, the Seva Mobile Kitchen Van was on the ground within 3 hours serving boiling hot khichdi and clean water.',
        impactText: '3,200 emergency meal packs delivered without interruption over 5 intense flood days.',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
        date: '2026-08-30'
      }
    ];

    this.stories = [...sampleStories];
    this.storySectionSettings.isEnabled = true;
    this.logAudit(reviewer, 'STORIES_SAMPLE_RESTORED', 'SuccessStory', 'Restored default sample verified stories.');

    // Persist to MongoDB Atlas
    SuccessStoryModel.deleteMany({}).then(() => {
      return SuccessStoryModel.insertMany(sampleStories.map(s => ({
        id: s.id,
        title: s.title,
        beneficiaryName: s.beneficiaryName,
        location: s.location,
        summary: s.summary,
        impactText: s.impactText,
        image: s.image,
        date: s.date
      })));
    }).catch((err: any) => console.warn('⚠️ MongoDB Atlas Stories seed error:', err.message));

    SettingModel.findOneAndUpdate(
      { key: 'story_section_settings' },
      { key: 'story_section_settings', value: this.storySectionSettings, updatedAt: new Date() },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Setting save error:', err.message));

    SettingModel.findOneAndUpdate(
      { key: 'stories_initialized' },
      { key: 'stories_initialized', value: true, updatedAt: new Date() },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Setting save error:', err.message));

    return this.stories;
  }

  // How It Works Step Management
  getHowItWorks() { return this.howItWorksSteps; }
  createHowItWorksStep(data: { number: string; title: string; desc: string; badge?: string }) {
    const newStep: IHowItWorksStep = {
      id: `step-${Date.now()}`,
      number: data.number,
      title: data.title,
      desc: data.desc,
      badge: data.badge || 'Digitally Verified'
    };
    this.howItWorksSteps.push(newStep);
    this.logAudit('System Admin', 'HOW_IT_WORKS_CREATED', 'HowItWorks', `Created step ${newStep.number}: ${newStep.title}`);
    HowItWorksModel.create(newStep).catch((err: any) => console.warn('⚠️ MongoDB Atlas HowItWorks save error:', err.message));
    return newStep;
  }

  updateHowItWorksStep(id: string, data: Partial<IHowItWorksStep>) {
    const idx = this.howItWorksSteps.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.howItWorksSteps[idx] = { ...this.howItWorksSteps[idx], ...data };
    this.logAudit('System Admin', 'HOW_IT_WORKS_UPDATED', 'HowItWorks', `Updated step ${this.howItWorksSteps[idx].number}`);
    HowItWorksModel.updateOne({ id }, { $set: data }).catch((err: any) => console.warn('⚠️ MongoDB Atlas HowItWorks update error:', err.message));
    return this.howItWorksSteps[idx];
  }

  deleteHowItWorksStep(id: string) {
    const idx = this.howItWorksSteps.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const removed = this.howItWorksSteps.splice(idx, 1);
    this.logAudit('System Admin', 'HOW_IT_WORKS_DELETED', 'HowItWorks', `Deleted step ${removed[0]?.number}`);
    HowItWorksModel.deleteOne({ id }).catch((err: any) => console.warn('⚠️ MongoDB Atlas HowItWorks delete error:', err.message));
    return true;
  }

  // FAQ Management
  getFAQs() { return this.faqs; }
  createFAQ(data: { q: string; a: string; category?: string }) {
    const newFAQ: IFAQItem = {
      id: `faq-${Date.now()}`,
      q: data.q,
      a: data.a,
      category: data.category || 'General'
    };
    this.faqs.push(newFAQ);
    this.logAudit('System Admin', 'FAQ_CREATED', 'FAQ', `Created FAQ: ${newFAQ.q.substring(0, 40)}...`);
    FAQModel.create(newFAQ).catch((err: any) => console.warn('⚠️ MongoDB Atlas FAQ save error:', err.message));
    return newFAQ;
  }

  updateFAQ(id: string, data: Partial<IFAQItem>) {
    const idx = this.faqs.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.faqs[idx] = { ...this.faqs[idx], ...data };
    this.logAudit('System Admin', 'FAQ_UPDATED', 'FAQ', `Updated FAQ: ${this.faqs[idx].q.substring(0, 40)}...`);
    FAQModel.updateOne({ id }, { $set: data }).catch((err: any) => console.warn('⚠️ MongoDB Atlas FAQ update error:', err.message));
    return this.faqs[idx];
  }

  deleteFAQ(id: string) {
    const idx = this.faqs.findIndex(f => f.id === id);
    if (idx === -1) return false;
    const removed = this.faqs.splice(idx, 1);
    this.logAudit('System Admin', 'FAQ_DELETED', 'FAQ', `Deleted FAQ: ${removed[0]?.q.substring(0, 40)}...`);
    FAQModel.deleteOne({ id }).catch((err: any) => console.warn('⚠️ MongoDB Atlas FAQ delete error:', err.message));
    return true;
  }

  // Site Settings & Counter controls
  getSettings() { return this.settings; }
  updateSettings(data: Partial<ISiteSettings>, reviewer: string = 'System Admin') {
    this.settings = { ...this.settings, ...data };
    this.logAudit(reviewer, 'SETTINGS_UPDATED', 'SiteSettings', 'Updated platform settings and impact counters');

    // Persist to MongoDB Atlas
    SettingModel.findOneAndUpdate(
      { key: 'site_settings' },
      { key: 'site_settings', value: this.settings },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Settings save error:', err.message));

    return this.settings;
  }

  // Real-Time Verified Metrics controls
  getVerifiedMetrics(): IVerifiedMetrics {
    return this.verifiedMetrics;
  }

  async updateVerifiedMetrics(data: Partial<IVerifiedMetrics>, reviewer: string = 'System Admin'): Promise<IVerifiedMetrics> {
    const parseNum = (val: any) => {
      if (val === undefined || val === null || val === '' || isNaN(Number(val))) {
        return 0;
      }
      const num = Number(val);
      return num < 0 ? 0 : num;
    };

    const updated: IVerifiedMetrics = {
      ...this.verifiedMetrics,
      totalMealsServed: parseNum(data.totalMealsServed),
      totalPeopleHelped: parseNum(data.totalPeopleHelped),
      activeVolunteersCount: parseNum(data.activeVolunteersCount),
      totalDistributionsCount: parseNum(data.totalDistributionsCount),
      totalDonated: parseNum(data.totalDonated),
      badgeText: (data.badgeText !== undefined && data.badgeText.trim() !== '') ? data.badgeText.trim() : (this.verifiedMetrics.badgeText || 'REAL-TIME VERIFIED METRICS'),
      heading: (data.heading !== undefined && data.heading.trim() !== '') ? data.heading.trim() : (this.verifiedMetrics.heading || 'Every Rupee Accounted For, Every Meal Counted'),
      subheading: (data.subheading !== undefined && data.subheading.trim() !== '') ? data.subheading.trim() : (this.verifiedMetrics.subheading || 'Data verified directly through ground distribution logs and administrator-reviewed photographic proof.'),
      mealsLabel: data.mealsLabel?.trim() || this.verifiedMetrics.mealsLabel,
      mealsSublabel: data.mealsSublabel?.trim() || this.verifiedMetrics.mealsSublabel,
      peopleLabel: data.peopleLabel?.trim() || this.verifiedMetrics.peopleLabel,
      peopleSublabel: data.peopleSublabel?.trim() || this.verifiedMetrics.peopleSublabel,
      volunteersLabel: data.volunteersLabel?.trim() || this.verifiedMetrics.volunteersLabel,
      volunteersSublabel: data.volunteersSublabel?.trim() || this.verifiedMetrics.volunteersSublabel,
      distributionsLabel: data.distributionsLabel?.trim() || this.verifiedMetrics.distributionsLabel,
      distributionsSublabel: data.distributionsSublabel?.trim() || this.verifiedMetrics.distributionsSublabel,
      donatedLabel: data.donatedLabel?.trim() || this.verifiedMetrics.donatedLabel,
      donatedSublabel: data.donatedSublabel?.trim() || this.verifiedMetrics.donatedSublabel,
      updatedBy: reviewer,
      updatedAt: new Date().toISOString()
    };

    this.verifiedMetrics = updated;
    this.logAudit(reviewer, 'VERIFIED_METRICS_UPDATED', 'VerifiedMetrics', `Admin updated verified metrics: Meals=${updated.totalMealsServed}, People=${updated.totalPeopleHelped}, Volunteers=${updated.activeVolunteersCount}, Distributions=${updated.totalDistributionsCount}, Aid=₹${updated.totalDonated}`);

    SettingModel.findOneAndUpdate(
      { key: 'verified_metrics' },
      { key: 'verified_metrics', value: this.verifiedMetrics },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Verified Metrics save error:', err.message));

    return this.verifiedMetrics;
  }

  async resetVerifiedMetrics(reviewer: string = 'System Admin'): Promise<IVerifiedMetrics> {
    const reset: IVerifiedMetrics = {
      ...this.verifiedMetrics,
      totalMealsServed: 0,
      totalPeopleHelped: 0,
      activeVolunteersCount: 0,
      totalDistributionsCount: 0,
      totalDonated: 0,
      updatedBy: reviewer,
      updatedAt: new Date().toISOString()
    };

    this.verifiedMetrics = reset;
    this.logAudit(reviewer, 'VERIFIED_METRICS_RESET', 'VerifiedMetrics', 'Admin reset all verified metrics to 0');

    SettingModel.findOneAndUpdate(
      { key: 'verified_metrics' },
      { key: 'verified_metrics', value: this.verifiedMetrics },
      { upsert: true }
    ).catch((err: any) => console.warn('⚠️ MongoDB Atlas Verified Metrics reset error:', err.message));

    return this.verifiedMetrics;
  }

  // Right Hero Visual Cards
  getRightHeroCard(): IRightHeroCard | null {
    return this.rightHeroCard;
  }

  async saveRightHeroCard(data: Partial<IRightHeroCard>, reviewer: string = 'System Admin'): Promise<IRightHeroCard> {
    const cardId = this.rightHeroCard?.id || 'hero-visual-card-primary';
    const updatedCard: IRightHeroCard = {
      ...this.rightHeroCard,
      ...data,
      id: cardId,
      title: data.title !== undefined ? data.title : (this.rightHeroCard?.title || ''),
      updatedBy: reviewer,
      updatedAt: new Date().toISOString()
    };
    this.rightHeroCard = updatedCard;
    this.logAudit(reviewer, 'RIGHT_HERO_CARDS_SAVED', 'RightHeroCard', `Saved Right Hero Visual Cards: "${updatedCard.title.substring(0, 40)}"`);

    try {
      await RightHeroCardModel.findOneAndUpdate(
        { id: cardId },
        { ...updatedCard, id: cardId },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas RightHeroCard save error:', err.message);
    }

    return this.rightHeroCard;
  }

  async deleteRightHeroCard(reviewer: string = 'System Admin'): Promise<boolean> {
    this.rightHeroCard = null;
    this.logAudit(reviewer, 'RIGHT_HERO_CARDS_CLEARED', 'RightHeroCard', 'Cleared Right Hero Visual Cards from platform');

    try {
      await RightHeroCardModel.deleteMany({});
    } catch (err: any) {
      console.warn('⚠️ MongoDB Atlas RightHeroCard delete error:', err.message);
    }

    return true;
  }


  // User & Auth Management
  getUsers() {
    return this.users.map(({ password, ...safeUser }) => safeUser);
  }

  getQuotas() {
    const adminUsers = this.users.filter(u => u.role === 'admin');
    const volUsers = this.users.filter(u => u.role === 'volunteer');
    const approvedVols = this.volunteers.filter(v => v.status === 'Approved');

    return {
      admins: {
        current: adminUsers.length,
        max: 2,
        isFull: adminUsers.length >= 2,
        availableSlots: Math.max(0, 2 - adminUsers.length),
        members: adminUsers.map(({ password, ...u }) => u)
      },
      volunteers: {
        current: volUsers.length,
        approvedCount: approvedVols.length,
        max: 4,
        isFull: volUsers.length >= 4,
        availableSlots: Math.max(0, 4 - volUsers.length),
        members: volUsers.map(({ password, ...u }) => u)
      }
    };
  }

  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  normalizeIdentifier(rawId: string): { type: 'email' | 'phone'; key: string } {
    const raw = (rawId || '').trim();
    if (raw.includes('@')) {
      return { type: 'email', key: raw.toLowerCase() };
    }
    const digits = raw.replace(/\D/g, '');
    const key = digits.length >= 10 ? digits.slice(-10) : digits;
    return { type: 'phone', key };
  }

  findUserByIdentifier(identifier: string) {
    const { type, key } = this.normalizeIdentifier(identifier);
    if (!key) return undefined;

    return this.users.find(u => {
      if (type === 'email') {
        return u.email && u.email.trim().toLowerCase() === key;
      } else {
        if (!u.phone) return false;
        const uDigits = u.phone.replace(/\D/g, '');
        const uKey = uDigits.length >= 10 ? uDigits.slice(-10) : uDigits;
        return uKey === key;
      }
    });
  }

  sendOTP(rawIdentifier: string, intent: 'login' | 'register', registerData?: any) {
    const { type, key } = this.normalizeIdentifier(rawIdentifier);
    if (!key || (type === 'phone' && key.length < 10) || (type === 'email' && !key.includes('@'))) {
      throw new Error('Please provide a valid 10-digit mobile number or email address.');
    }

    const existingUser = this.findUserByIdentifier(rawIdentifier);

    if (intent === 'login') {
      if (!existingUser) {
        throw new Error(`No registered account found with ${type === 'phone' ? 'mobile number ' + rawIdentifier : 'email ' + rawIdentifier}. Please register an account first.`);
      }
    } else {
      if (existingUser) {
        throw new Error(`An account already exists with this ${type === 'phone' ? 'mobile number' : 'email'}. Please sign in with OTP instead.`);
      }

      if (registerData?.role === 'admin') {
        const currentAdmins = this.users.filter(u => u.role === 'admin').length;
        if (currentAdmins >= 2) {
          throw new Error('Maximum admin capacity reached. The platform strictly permits a maximum of 2 Administrators.');
        }
      }

      if (registerData?.role === 'volunteer') {
        const currentVols = this.users.filter(u => u.role === 'volunteer').length;
        if (currentVols >= 4) {
          throw new Error('Maximum volunteer capacity reached. The platform strictly permits a maximum of 4 Volunteers.');
        }
      }
    }

    // Cryptographically randomized 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.otps.set(key, {
      identifier: rawIdentifier,
      code,
      expiresAt,
      intent,
      registerData
    });

    this.logAudit(
      rawIdentifier,
      'OTP_SENT',
      'Auth',
      `Sent 6-digit OTP code to ${type === 'phone' ? 'mobile' : 'email'} ${rawIdentifier} (${intent})`
    );

    return {
      success: true,
      message: `Verification code sent to ${rawIdentifier}.`,
      type,
      identifier: rawIdentifier,
      otpPreview: code,
      expiresInMinutes: 10
    };
  }

  verifyOTP(rawIdentifier: string, inputCode: string, extraRegisterData?: any) {
    const { type, key } = this.normalizeIdentifier(rawIdentifier);
    if (!key) throw new Error('Invalid mobile number or email.');

    const entry = this.otps.get(key);
    if (!entry) {
      throw new Error('No OTP request found for this mobile or email. Please request a new verification code.');
    }

    if (Date.now() > entry.expiresAt) {
      this.otps.delete(key);
      throw new Error('Verification code has expired. Please request a new OTP.');
    }

    if (entry.code !== (inputCode || '').trim()) {
      throw new Error('Incorrect verification code. Please check and try again.');
    }

    // OTP matched! Remove to prevent reuse
    this.otps.delete(key);

    if (entry.intent === 'login') {
      const user = this.findUserByIdentifier(rawIdentifier);
      if (!user) {
        throw new Error('User account not found.');
      }

      if (user.role === 'volunteer') {
        const vol = this.volunteers.find(v => v.email.toLowerCase() === user.email.toLowerCase() || (user.volunteerId && v.volunteerId === user.volunteerId));
        if (vol) {
          user.volunteerStatus = vol.status;
          user.volunteerId = vol.volunteerId;
        }
      }

      user.token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const { password, ...safeUser } = user;
      this.logAudit(user.email || user.phone || 'OTP_User', 'OTP_LOGIN', 'User', `Logged in via ${type} OTP verification as ${user.role}`);
      return safeUser;
    } else {
      // Registration flow
      const regData = { ...entry.registerData, ...extraRegisterData };
      const email = type === 'email' ? rawIdentifier.trim().toLowerCase() : (regData.email || `user_${Date.now()}@seva.org`);
      const phone = type === 'phone' ? rawIdentifier.trim() : (regData.phone || '');

      const newUser = this.createUser({
        name: regData.name || (type === 'phone' ? `Seva Member (${key.slice(-4)})` : 'Seva Member'),
        email,
        phone,
        password: regData.password || `otp_auth_${Date.now()}`,
        role: regData.role || 'donor',
        area: regData.area,
        skills: regData.skills,
        availability: regData.availability
      });

      this.logAudit(email, 'OTP_REGISTER', 'User', `Registered account via ${type} OTP as ${newUser.role}`);
      return newUser;
    }
  }

  createUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'volunteer' | 'donor';
    phone?: string;
    area?: string;
    skills?: string[];
    availability?: string;
  }) {
    const existing = this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    // Role capacity enforcement
    if (data.role === 'admin') {
      const currentAdmins = this.users.filter(u => u.role === 'admin').length;
      if (currentAdmins >= 2) {
        throw new Error('Maximum admin capacity reached. The platform strictly permits a maximum of 2 Administrators.');
      }
    }

    if (data.role === 'volunteer') {
      const currentVols = this.users.filter(u => u.role === 'volunteer').length;
      if (currentVols >= 4) {
        throw new Error('Maximum volunteer capacity reached. The platform strictly permits a maximum of 4 Volunteers.');
      }
    }

    const randomVolCode = Math.floor(1000 + Math.random() * 9000);
    const volunteerId = data.role === 'volunteer' ? `SEVA-VOL-${randomVolCode}` : undefined;

    const newUser: IUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone || '',
      area: data.area || '',
      skills: data.skills || [],
      availability: data.availability || 'Weekends',
      volunteerStatus: data.role === 'volunteer' ? 'Pending' : undefined,
      volunteerId,
      token: `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    if (data.role === 'volunteer') {
      const volEntry = {
        id: `vol-${Date.now()}`,
        volunteerId: volunteerId!,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        area: data.area || 'General District',
        skills: data.skills && data.skills.length > 0 ? data.skills : ['Field Assistance'],
        availability: (data.availability as any) || 'Weekends',
        status: 'Pending' as const,
        hoursLogged: 0,
        tasksCompleted: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      this.volunteers.push(volEntry);

      // Persist volunteer to MongoDB Atlas
      VolunteerModel.create(volEntry).catch((err: any) => console.warn('⚠️ MongoDB Atlas Volunteer save error:', err.message));
    }

    this.users.push(newUser);
    this.logAudit(newUser.email, 'USER_REGISTERED', 'User', `Registered as ${newUser.role} (Status: ${newUser.volunteerStatus || 'Active'})`);

    // Persist user to MongoDB Atlas
    UserModel.create({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      phone: newUser.phone,
      area: newUser.area,
      skills: newUser.skills,
      availability: newUser.availability,
      volunteerStatus: newUser.volunteerStatus,
      volunteerId: newUser.volunteerId,
      token: newUser.token
    }).catch((err: any) => console.warn('⚠️ MongoDB Atlas User save error:', err.message));

    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  deleteUser(id: string) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    const user = this.users[idx];
    this.users.splice(idx, 1);
    if (user.role === 'volunteer') {
      const vIdx = this.volunteers.findIndex(v => v.email.toLowerCase() === user.email.toLowerCase() || v.id === user.id);
      if (vIdx !== -1) this.volunteers.splice(vIdx, 1);
    }
    return true;
  }

  authenticateUser(email: string, pass: string) {
    const user = this.findUserByEmail(email);
    if (!user || user.password !== pass) {
      throw new Error('Invalid email or password.');
    }

    if (user.role === 'volunteer') {
      const vol = this.volunteers.find(v => v.email.toLowerCase() === user.email.toLowerCase() || (user.volunteerId && v.volunteerId === user.volunteerId));
      if (vol) {
        user.volunteerStatus = vol.status;
        user.volunteerId = vol.volunteerId;
      }
    }

    user.token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const { password, ...safeUser } = user;
    this.logAudit(user.email, 'USER_LOGIN', 'User', `Logged in as ${user.role} (Volunteer Status: ${user.volunteerStatus || 'N/A'})`);
    return safeUser;
  }

  getUserFromToken(token: string) {
    const user = this.users.find(u => u.token === token);
    if (!user) return null;

    if (user.role === 'volunteer') {
      const vol = this.volunteers.find(v => v.email.toLowerCase() === user.email.toLowerCase() || (user.volunteerId && v.volunteerId === user.volunteerId));
      if (vol) {
        user.volunteerStatus = vol.status;
      }
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  getAuditLogs() { return this.auditLogs; }

  logAudit(user: string, action: string, entity: string, details: string) {
    const entry: IAuditLog = {
      id: `log-${Date.now()}`,
      user,
      action,
      entity,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.auditLogs.unshift(entry);

    AuditLogModel.create({
      user: entry.user,
      action: entry.action,
      entity: entry.entity,
      details: entry.details,
      timestamp: new Date()
    }).catch(() => {});
  }

  // Bidirectional Synchronization with MongoDB Atlas
  async syncWithMongoDB() {
    try {
      console.log('🔄 Synchronizing data store with MongoDB Atlas...');

      // 1. Users (Loaded dynamically from MongoDB Atlas, zero demo accounts)
      const dbUsers = await UserModel.find().lean();
      this.users = dbUsers.map((u: any) => ({
        id: u.id || u._id?.toString(),
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        volunteerStatus: u.volunteerStatus,
        volunteerId: u.volunteerId,
        phone: u.phone,
        area: u.area,
        skills: u.skills,
        availability: u.availability,
        avatar: u.avatar,
        token: u.token,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()
      }));

      // 2. Volunteers (Loaded dynamically from MongoDB Atlas, zero demo volunteers)
      const dbVols = await VolunteerModel.find().lean();
      this.volunteers = dbVols.map((v: any) => ({
        id: v.id || v._id?.toString(),
        volunteerId: v.volunteerId,
        name: v.name,
        email: v.email,
        phone: v.phone,
        area: v.area,
        skills: v.skills,
        availability: v.availability,
        status: v.status,
        hoursLogged: v.hoursLogged,
        tasksCompleted: v.tasksCompleted,
        joinedDate: v.joinedDate || new Date().toISOString().split('T')[0],
        photo: v.photo
      }));

      // 3. Campaigns
      const campaignsInitialized = await SettingModel.findOne({ key: 'campaigns_initialized' }).lean();
      const campCount = await CampaignModel.countDocuments();
      if (!campaignsInitialized && campCount === 0) {
        console.log('🌱 Initializing campaigns in MongoDB Atlas...');
        await CampaignModel.insertMany(this.campaigns.map(c => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          targetAmount: c.targetAmount,
          collectedAmount: c.collectedAmount,
          mealsSupported: c.mealsSupported,
          donorCount: c.donorCount,
          coverImage: c.coverImage,
          location: c.location,
          status: c.status,
          isEmergency: c.isEmergency,
          category: c.category
        })));
        await SettingModel.create({ key: 'campaigns_initialized', value: true });
      } else {
        const dbCamps = await CampaignModel.find().lean();
        this.campaigns = dbCamps.map((c: any) => ({
          id: c.id || c._id?.toString(),
          title: c.title,
          slug: c.slug,
          description: c.description,
          targetAmount: c.targetAmount,
          collectedAmount: c.collectedAmount,
          mealsSupported: c.mealsSupported,
          donorCount: c.donorCount,
          coverImage: c.coverImage,
          location: c.location,
          status: c.status,
          isEmergency: c.isEmergency,
          category: c.category
        }));
      }

      // Campaign Section (Support an Active Campaign) Settings
      const savedCampSection = await SettingModel.findOne({ key: 'campaign_section_settings' }).lean();
      if (savedCampSection && (savedCampSection as any).value) {
        this.campaignSectionSettings = { ...this.campaignSectionSettings, ...((savedCampSection as any).value as any) };
      }

      // Distribution Section (Recent Ground Distributions) Settings
      const savedDistSection = await SettingModel.findOne({ key: 'distribution_section_settings' }).lean();
      if (savedDistSection && (savedDistSection as any).value) {
        this.distributionSectionSettings = { ...this.distributionSectionSettings, ...((savedDistSection as any).value as any) };
      }

      // Ground Distributions Sync
      const distributionsInitialized = await SettingModel.findOne({ key: 'distributions_initialized' }).lean();
      const distCount = await DistributionEventModel.countDocuments();
      if (!distributionsInitialized && distCount === 0) {
        console.log('🌱 Initializing distributions in MongoDB Atlas...');
        await DistributionEventModel.insertMany(this.distributions.map(d => ({
          eventId: d.eventId,
          campaignTitle: d.campaignTitle,
          location: d.location,
          date: new Date(d.date),
          volunteersAssigned: d.volunteersAssigned,
          mealsDistributed: d.mealsDistributed,
          beneficiariesCount: d.beneficiariesCount,
          foodSource: d.foodSource,
          proofPhotos: d.proofPhotos,
          status: d.status,
          notes: d.notes
        })));
        await SettingModel.create({ key: 'distributions_initialized', value: true });
      } else {
        const dbDists = await DistributionEventModel.find().lean();
        this.distributions = dbDists.map((d: any) => ({
          id: d.id || d._id?.toString(),
          eventId: d.eventId,
          campaignTitle: d.campaignTitle,
          location: d.location,
          date: d.date ? new Date(d.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          volunteersAssigned: d.volunteersAssigned || [],
          mealsDistributed: d.mealsDistributed || 0,
          beneficiariesCount: d.beneficiariesCount || 0,
          foodSource: d.foodSource || 'Seva Relief Kitchen',
          proofPhotos: d.proofPhotos && d.proofPhotos.length > 0 ? d.proofPhotos : ['https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop'],
          status: d.status || 'Verified',
          notes: d.notes || ''
        }));
      }

      // 4. Donations (Loaded dynamically from MongoDB Atlas, zero demo donations)
      const dbDons = await DonationModel.find().lean();
      this.donations = dbDons.map((d: any) => ({
        id: d.id || d._id?.toString(),
        donationId: d.donationId,
        donorName: d.donorName,
        donorEmail: d.donorEmail,
        donorPhone: d.donorPhone,
        amount: d.amount,
        campaignId: d.campaignId,
        campaignTitle: d.campaignTitle,
        paymentMethod: d.paymentMethod,
        status: d.status,
        transactionId: d.transactionId,
        isAnonymous: d.isAnonymous,
        recurringFrequency: d.recurringFrequency,
        collectedBy: d.collectedBy,
        receiptNote: d.receiptNote,
        verifiedBy: d.verifiedBy,
        verifiedAt: d.verifiedAt ? new Date(d.verifiedAt).toISOString() : undefined,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()
      })).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // 5. Site Settings
      const savedSettings = await SettingModel.findOne({ key: 'site_settings' }).lean();
      if (!savedSettings) {
        console.log('🌱 Seeding platform settings to MongoDB Atlas...');
        await SettingModel.create({ key: 'site_settings', value: this.settings });
      } else if (savedSettings && (savedSettings as any).value) {
        this.settings = { ...this.settings, ...((savedSettings as any).value as any) };
      }

      // Story Section Settings
      const savedStorySettings = await SettingModel.findOne({ key: 'story_section_settings' }).lean();
      if (!savedStorySettings) {
        await SettingModel.create({ key: 'story_section_settings', value: this.storySectionSettings });
      } else if (savedStorySettings && (savedStorySettings as any).value) {
        this.storySectionSettings = { ...this.storySectionSettings, ...((savedStorySettings as any).value as any) };
      }

      // 6. Success Stories
      const storiesInitSetting = await SettingModel.findOne({ key: 'stories_initialized' });
      if (!storiesInitSetting) {
        const storyCount = await SuccessStoryModel.countDocuments();
        if (storyCount === 0) {
          console.log('🌱 Seeding success stories to MongoDB Atlas...');
          await SuccessStoryModel.insertMany(this.stories.map(s => ({
            id: s.id,
            title: s.title,
            beneficiaryName: s.beneficiaryName,
            location: s.location,
            summary: s.summary,
            impactText: s.impactText,
            image: s.image,
            date: s.date
          })));
        }
        await SettingModel.findOneAndUpdate(
          { key: 'stories_initialized' },
          { key: 'stories_initialized', value: true, updatedAt: new Date() },
          { upsert: true }
        );
      } else {
        const dbStories = await SuccessStoryModel.find().lean();
        this.stories = dbStories.map((s: any) => ({
          id: (s as any).id || (s as any)._id?.toString(),
          title: (s as any).title,
          beneficiaryName: (s as any).beneficiaryName,
          location: (s as any).location,
          summary: (s as any).summary,
          impactText: (s as any).impactText,
          image: (s as any).image,
          date: (s as any).date || new Date().toISOString().split('T')[0]
        }));
      }

      // 7. How It Works Steps
      const stepCount = await HowItWorksModel.countDocuments();
      if (stepCount === 0) {
        console.log('🌱 Seeding How-It-Works steps to MongoDB Atlas...');
        await HowItWorksModel.insertMany(this.howItWorksSteps.map(s => ({
          id: s.id,
          number: s.number,
          title: s.title,
          desc: s.desc,
          badge: s.badge
        })));
      } else {
        const dbSteps = await HowItWorksModel.find().lean();
        if (dbSteps.length > 0) {
          this.howItWorksSteps = dbSteps.map((s: any) => ({
            id: (s as any).id || (s as any)._id?.toString(),
            number: (s as any).number,
            title: (s as any).title,
            desc: (s as any).desc,
            badge: (s as any).badge || 'Digitally Verified'
          }));
        }
      }

      // 8. FAQs
      const faqCount = await FAQModel.countDocuments();
      if (faqCount === 0) {
        console.log('🌱 Seeding FAQs to MongoDB Atlas...');
        await FAQModel.insertMany(this.faqs.map(f => ({
          id: f.id,
          q: f.q,
          a: f.a,
          category: f.category
        })));
      } else {
        const dbFaqs = await FAQModel.find().lean();
        if (dbFaqs.length > 0) {
          this.faqs = dbFaqs.map((f: any) => ({
            id: (f as any).id || (f as any)._id?.toString(),
            q: (f as any).q,
            a: (f as any).a,
            category: (f as any).category || 'General'
          }));
        }
      }

      // 9. Committee Members
      const comCount = await CommitteeMemberModel.countDocuments();
      if (comCount === 0) {
        console.log('🌱 Seeding Committee Members to MongoDB Atlas...');
        await CommitteeMemberModel.insertMany(this.committee.map(m => ({
          id: m.id,
          name: m.name,
          designation: m.designation,
          bio: m.bio,
          responsibilities: m.responsibilities,
          photo: m.photo
        })));
      } else {
        const dbCom = await CommitteeMemberModel.find().lean();
        if (dbCom.length > 0) {
          this.committee = dbCom.map((m: any) => ({
            id: (m as any).id || (m as any)._id?.toString(),
            name: (m as any).name,
            designation: (m as any).designation,
            bio: (m as any).bio,
            responsibilities: (m as any).responsibilities,
            photo: (m as any).photo
          }));
        }
      }

      // 10. Expenses
      const expCount = await ExpenseModel.countDocuments();
      if (expCount === 0) {
        console.log('🌱 Seeding Expenses to MongoDB Atlas...');
        await ExpenseModel.insertMany(this.expenses.map(e => ({
          id: e.id,
          expenseId: (e as any).expenseId || e.id,
          amount: e.amount,
          category: e.category,
          campaignTitle: e.campaignTitle,
          date: e.date,
          description: e.description,
          approvedBy: e.approvedBy
        })));
      } else {
        const dbExp = await ExpenseModel.find().lean();
        if (dbExp.length > 0) {
          this.expenses = dbExp.map((e: any) => ({
            id: (e as any).id || (e as any)._id?.toString(),
            expenseId: (e as any).expenseId || (e as any).id,
            amount: (e as any).amount,
            category: (e as any).category,
            campaignTitle: (e as any).campaignTitle,
            date: (e as any).date ? new Date((e as any).date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: (e as any).description,
            approvedBy: (e as any).approvedBy || 'Admin'
          }));
        }
      }

      // 11. Right Hero Visual Cards (Loaded from MongoDB Atlas, null if admin has not written anything)
      const dbHeroCard = await RightHeroCardModel.findOne().lean();
      if (dbHeroCard) {
        this.rightHeroCard = {
          id: (dbHeroCard as any).id || (dbHeroCard as any)._id?.toString(),
          badgeText: (dbHeroCard as any).badgeText || 'Live Field Dispatch',
          timeAgo: (dbHeroCard as any).timeAgo || '12 mins ago',
          title: (dbHeroCard as any).title || '',
          imageUrl: (dbHeroCard as any).imageUrl || '',
          raisedAmount: (dbHeroCard as any).raisedAmount || 0,
          goalAmount: (dbHeroCard as any).goalAmount || 0,
          progressPercentage: (dbHeroCard as any).progressPercentage || 0,
          impactCardTag: (dbHeroCard as any).impactCardTag || 'Direct Impact',
          impactCardText: (dbHeroCard as any).impactCardText || '₹20 = 1 Nourishing Meal',
          impactCardIcon: (dbHeroCard as any).impactCardIcon || '✓',
          showImpactCard: (dbHeroCard as any).showImpactCard !== false,
          volunteerCardTag: (dbHeroCard as any).volunteerCardTag || 'Volunteers',
          volunteerCardText: (dbHeroCard as any).volunteerCardText || '840+ Active on Field',
          volunteerCardIcon: (dbHeroCard as any).volunteerCardIcon || '★',
          showVolunteerCard: (dbHeroCard as any).showVolunteerCard !== false,
          isActive: (dbHeroCard as any).isActive !== false,
          updatedBy: (dbHeroCard as any).updatedBy || 'Admin',
          updatedAt: (dbHeroCard as any).updatedAt
        };
      } else {
        this.rightHeroCard = null;
      }

      // Verified Metrics
      const savedVerifiedMetrics = await SettingModel.findOne({ key: 'verified_metrics' }).lean();
      if (!savedVerifiedMetrics) {
        console.log('🌱 Initializing verified metrics in MongoDB Atlas (defaulting to 0)...');
        await SettingModel.create({ key: 'verified_metrics', value: this.verifiedMetrics });
      } else if (savedVerifiedMetrics && (savedVerifiedMetrics as any).value) {
        this.verifiedMetrics = { ...this.verifiedMetrics, ...((savedVerifiedMetrics as any).value as any) };
      }

      console.log('✅ Synchronized store with MongoDB Atlas collections successfully.');
    } catch (error: any) {
      console.warn('⚠️ Error during MongoDB Atlas sync (continuing with in-memory cache):', error.message);
    }
  }

  getGlobalStats() {
    const totalDonated = this.verifiedMetrics.totalDonated;
    const totalMealsServed = this.verifiedMetrics.totalMealsServed;
    const totalPeopleHelped = this.verifiedMetrics.totalPeopleHelped;
    const activeVolunteersCount = this.verifiedMetrics.activeVolunteersCount;
    const totalDistributionsCount = this.verifiedMetrics.totalDistributionsCount;

    return {
      totalDonated,
      totalMealsServed,
      totalPeopleHelped,
      activeVolunteersCount,
      totalDistributionsCount,
      activeCampaignsCount: this.campaigns.filter(c => c.status === 'Active').length,
      settings: this.settings,
      verifiedMetrics: this.verifiedMetrics
    };
  }
}

export const serverStore = new SevaServerStore();
