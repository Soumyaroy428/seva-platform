export type UserRole = 'admin' | 'donor' | 'volunteer' | 'beneficiary';

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  volunteerStatus?: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
  volunteerId?: string;
  area?: string;
  skills?: string[];
  availability?: string;
  avatar?: string;
  token?: string;
  createdAt?: string | Date;
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

export interface ISiteSettings {
  siteTitle: string;
  tagline: string;
  helplinePhone: string;
  minDonationINR: number;
  emergencyBannerEnabled: boolean;
  emergencyBannerBadge?: string;
  emergencyBannerText: string;
  trustTagline?: string;
  bannerTheme?: 'orange' | 'amber' | 'red' | 'emerald' | 'slate';
  totalMealsOffset: number;
  totalPeopleOffset: number;
  activeVolunteersOffset: number;
  targetDonationGoal: number;
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

export interface ICampaign {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  mealsSupported: number;
  donorCount: number;
  coverImage: string;
  location: string;
  startDate?: string;
  endDate?: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  isEmergency?: boolean;
  category: 'Food Relief' | 'Disaster' | 'Education' | 'Community Kitchen' | 'Medical Supplies';
}

export interface IDonation {
  _id?: string;
  id?: string;
  donationId: string; // SEVA-DON-2026-XXXXXX
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number; // >= 20
  campaignId?: string;
  campaignTitle?: string;
  paymentMethod: 'UPI' | 'QR' | 'Card' | 'Netbanking' | 'Cash' | 'Cheque';
  status: 'Pending' | 'Processing' | 'Successful' | 'Failed' | 'Verification Required' | 'Rejected' | 'Refunded' | 'Verified';
  transactionId?: string;
  paymentProofUrl?: string;
  isAnonymous?: boolean;
  recurringFrequency?: 'None' | 'Weekly' | 'Monthly' | 'Quarterly';
  collectedBy?: string;
  receiptNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: string | Date;
}

export interface IPaymentQR {
  _id?: string;
  id?: string;
  qrId: string;
  title: string;
  upiId: string;
  accountName: string;
  location: string;
  qrImageUrl: string;
  uploadedBy: string;
  status: 'Pending' | 'Active' | 'Rejected' | 'Expired' | 'Disabled';
  createdAt?: string | Date;
}

export interface IFoodDonation {
  _id?: string;
  id?: string;
  donorName: string;
  donorPhone: string;
  foodType: string;
  quantity: string;
  estimatedServings: number;
  preparedAt: string;
  safeUntil: string;
  dietaryCategory: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain';
  packaging: string;
  pickupLocation: string;
  pickupTime: string;
  status: 'Pending' | 'Assigned' | 'Collected' | 'Distributed' | 'Expired';
  notes?: string;
}

export interface IVolunteer {
  _id?: string;
  id?: string;
  volunteerId: string; // SEVA-VOL-XXXX
  name: string;
  email: string;
  phone: string;
  area: string;
  skills: string[];
  availability: 'Weekdays' | 'Weekends' | 'Full-Time' | 'Emergency Call';
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
  hoursLogged: number;
  tasksCompleted: number;
  joinedDate?: string;
}

export interface IBeneficiary {
  _id?: string;
  id?: string;
  beneficiaryId: string; // SEVA-BEN-XXXX
  name: string;
  familyHeadName?: string;
  area: string;
  householdSize: number;
  category: 'Daily Wage' | 'Elderly' | 'Disaster Affected' | 'Orphanage' | 'Homeless';
  verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Inactive';
  qrToken?: string;
  mealsReceived: number;
  lastAssistanceDate?: string;
}

export interface IDistributionEvent {
  _id?: string;
  id?: string;
  eventId?: string; // SEVA-DIST-XXXX
  campaignTitle: string;
  location: string;
  date: string;
  volunteersAssigned?: string[];
  volunteersInvolved?: string[] | string;
  mealsDistributed: number;
  beneficiariesCount: number;
  foodSource?: string;
  proofPhotos?: string[];
  proofPhoto?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Verified' | 'Draft';
  notes?: string;
}

export interface IExpense {
  _id?: string;
  id?: string;
  amount: number;
  category: 'Food Purchases' | 'Transportation' | 'Packaging' | 'Medical Supplies' | 'Logistics' | 'Operations';
  campaignTitle: string;
  date: string;
  description: string;
  receiptUrl?: string;
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

export interface IStorySectionSettings {
  isEnabled: boolean;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  consentBadgeText?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ISuccessStory {
  _id?: string;
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

export interface IHowItWorksStep {
  id: string;
  number: string;
  title: string;
  desc: string;
  icon?: string;
}

export interface IFAQItem {
  id: string;
  q: string;
  a: string;
}

export interface IRightHeroCard {
  _id?: string;
  id?: string;
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


