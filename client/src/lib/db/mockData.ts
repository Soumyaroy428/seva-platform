import {
  ICampaign,
  IDonation,
  IPaymentQR,
  IFoodDonation,
  IVolunteer,
  IBeneficiary,
  IDistributionEvent,
  IExpense,
  ICommitteeMember,
  ISuccessStory,
  IAuditLog
} from '../types';

export const initialCampaigns: ICampaign[] = [
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
    isEmergency: false,
    startDate: '2026-08-01',
    endDate: '2026-10-31'
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
    isEmergency: true,
    startDate: '2026-08-20',
    endDate: '2026-09-30'
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
    isEmergency: false,
    startDate: '2026-07-15',
    endDate: '2026-11-15'
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
    isEmergency: false,
    startDate: '2026-08-10',
    endDate: '2026-12-31'
  }
];

export const initialDonations: IDonation[] = [
  {
    id: 'don-1',
    donationId: 'SEVA-DON-2026-000123',
    donorName: 'Rahul Sharma',
    donorEmail: 'rahul.sharma@example.com',
    donorPhone: '+91 98765 43210',
    amount: 500,
    campaignTitle: 'Warm Meals for Slum Children & Families',
    paymentMethod: 'UPI',
    status: 'Successful',
    transactionId: 'UPI-RRR-94827104921',
    isAnonymous: false,
    recurringFrequency: 'Monthly',
    createdAt: '2026-09-04T10:15:00Z'
  },
  {
    id: 'don-2',
    donationId: 'SEVA-DON-2026-000124',
    donorName: 'Priya Mukherjee',
    donorEmail: 'priya.m@example.com',
    amount: 1000,
    campaignTitle: 'Emergency Flood Relief Kitchen 2026',
    paymentMethod: 'Card',
    status: 'Successful',
    transactionId: 'TXN-CARD-58392147',
    isAnonymous: false,
    recurringFrequency: 'None',
    createdAt: '2026-09-04T14:30:00Z'
  },
  {
    id: 'don-3',
    donationId: 'SEVA-DON-2026-000125',
    donorName: 'Ananya Sen',
    donorEmail: 'ananya.sen@example.com',
    amount: 250,
    campaignTitle: 'Daily Evening Hunger Relief Cart',
    paymentMethod: 'QR',
    status: 'Successful',
    transactionId: 'UTR-2026-0904-8832',
    isAnonymous: false,
    recurringFrequency: 'None',
    createdAt: '2026-09-05T09:00:00Z'
  },
  {
    id: 'don-4',
    donationId: 'SEVA-DON-2026-000126',
    donorName: 'Kind Supporter',
    donorEmail: 'anonymous@seva.org',
    amount: 2000,
    campaignTitle: 'Emergency Flood Relief Kitchen 2026',
    paymentMethod: 'UPI',
    status: 'Successful',
    transactionId: 'UPI-TXN-73910248',
    isAnonymous: true,
    recurringFrequency: 'None',
    createdAt: '2026-09-05T12:45:00Z'
  }
];

export const initialPaymentQRs: IPaymentQR[] = [
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

export const initialVolunteers: IVolunteer[] = [
  {
    id: 'vol-1',
    volunteerId: 'SEVA-VOL-1042',
    name: 'Amitabh Roy',
    email: 'amitabh.roy@example.com',
    phone: '+91 94331 92841',
    area: 'North Sector & Lake Gardens',
    skills: ['Driving', 'First Aid', 'Food Quality Inspection', 'Crowd Management'],
    availability: 'Weekends',
    status: 'Approved',
    hoursLogged: 46,
    tasksCompleted: 18,
    joinedDate: '2026-04-12'
  },
  {
    id: 'vol-2',
    volunteerId: 'SEVA-VOL-1088',
    name: 'Sneha Banerjee',
    email: 'sneha.b@example.com',
    phone: '+91 98302 11943',
    area: 'East Bypass & Suburbs',
    skills: ['Nutritionist', 'Packaging', 'Beneficiary Verification'],
    availability: 'Full-Time',
    status: 'Approved',
    hoursLogged: 78,
    tasksCompleted: 31,
    joinedDate: '2026-03-01'
  },
  {
    id: 'vol-3',
    volunteerId: 'SEVA-VOL-1102',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@example.com',
    phone: '+91 91234 56789',
    area: 'Central Bus Terminal & Station',
    skills: ['Inventory', 'Logistics', 'Photography'],
    availability: 'Weekdays',
    status: 'Approved',
    hoursLogged: 24,
    tasksCompleted: 12,
    joinedDate: '2026-06-15'
  }
];

export const initialBeneficiaries: IBeneficiary[] = [
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
    lastAssistanceDate: '2026-09-04'
  },
  {
    id: 'ben-2',
    beneficiaryId: 'SEVA-BEN-30492',
    name: 'Ramanathan G.',
    familyHeadName: 'Ramanathan G.',
    area: 'Riverbank Inundation Shelter #2',
    householdSize: 3,
    category: 'Disaster Affected',
    verificationStatus: 'Verified',
    mealsReceived: 64,
    lastAssistanceDate: '2026-09-05'
  },
  {
    id: 'ben-3',
    beneficiaryId: 'SEVA-BEN-30493',
    name: 'Saraswati Mondal',
    familyHeadName: 'Saraswati Mondal (Widowed)',
    area: 'Shantipur Brick Kiln Settlement',
    householdSize: 4,
    category: 'Elderly',
    verificationStatus: 'Verified',
    mealsReceived: 88,
    lastAssistanceDate: '2026-09-03'
  }
];

export const initialDistributions: IDistributionEvent[] = [
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

export const initialFoodDonations: IFoodDonation[] = [
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
    notes: 'Surplus wedding catering food, chilled immediately in cold storage.'
  }
];

export const initialExpenses: IExpense[] = [
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
  },
  {
    id: 'exp-3',
    amount: 5400,
    category: 'Packaging',
    campaignTitle: 'Warm Meals for Slum Children & Families',
    date: '2026-09-01',
    description: 'Eco-friendly biodegradable meal containers and sealed spoons (2,000 sets).',
    approvedBy: 'Logistics Coordinator'
  }
];

export const initialCommitteeMembers: ICommitteeMember[] = [
  {
    id: 'com-1',
    name: 'Dr. Alok Sen Sharma',
    designation: 'Managing Trustee & President',
    bio: 'Former public health administrator with over 28 years in emergency humanitarian food logistics and disaster mitigation.',
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
  },
  {
    id: 'com-3',
    name: 'Ravi Teja Varma, FCA',
    designation: 'Treasurer & Audit Head',
    bio: 'Senior Chartered Accountant ensuring 100% transparent fund utilization, 80G tax compliance, and public expense logs.',
    responsibilities: 'Financial audit, receipt verification, and transparency reports.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop'
  }
];

export const initialSuccessStories: ISuccessStory[] = [
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

export const initialAuditLogs: IAuditLog[] = [
  {
    id: 'log-1',
    user: 'System Admin',
    action: 'QR_APPROVED',
    entity: 'PaymentQR',
    details: 'Approved QR code QR-FLOOD-DISPATCH for mobile flood operations.',
    timestamp: '2026-09-01 11:20:00'
  },
  {
    id: 'log-2',
    user: 'System Admin',
    action: 'DONATION_VERIFIED',
    entity: 'Donation',
    details: 'Verified UTR-2026-0904-8832 for ₹250 contribution.',
    timestamp: '2026-09-04 15:40:00'
  },
  {
    id: 'log-3',
    user: 'volunteer.amitabh@seva.org',
    action: 'DISTRIBUTION_SUBMITTED',
    entity: 'DistributionEvent',
    details: 'Logged 450 meals distributed at Shelter Camp 3 with 2 geo-tagged proof photos.',
    timestamp: '2026-09-04 18:10:00'
  }
];
