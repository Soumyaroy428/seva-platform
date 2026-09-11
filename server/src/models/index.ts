import mongoose, { Schema, Model } from 'mongoose';

// 1. User Model
const UserSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'donor', 'volunteer', 'beneficiary'], default: 'donor' },
  volunteerStatus: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Suspended'] },
  volunteerId: { type: String },
  area: { type: String },
  skills: [{ type: String }],
  availability: { type: String },
  avatar: { type: String },
  token: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Donor Model
const DonorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  totalDonated: { type: Number, default: 0 },
  donationCount: { type: Number, default: 0 },
  lastDonationDate: { type: Date },
  recurringStatus: { type: String, default: 'None' }
}, { timestamps: true });

// 3. Volunteer Model
const VolunteerSchema = new Schema({
  id: { type: String },
  volunteerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  area: { type: String, required: true },
  skills: [{ type: String }],
  availability: { type: String, default: 'Weekends' },
  status: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Suspended'], default: 'Pending' },
  hoursLogged: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  joinedDate: { type: String },
  photo: { type: String }
}, { timestamps: true });

// 4. Beneficiary Model
const BeneficiarySchema = new Schema({
  beneficiaryId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  familyHeadName: { type: String },
  area: { type: String, required: true },
  householdSize: { type: Number, default: 1 },
  category: { type: String, default: 'Daily Wage' },
  verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Inactive'], default: 'Verified' },
  qrToken: { type: String },
  mealsReceived: { type: Number, default: 0 }
}, { timestamps: true });

// 5. Campaign Model
const CampaignSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  collectedAmount: { type: Number, default: 0 },
  mealsSupported: { type: Number, default: 0 },
  donorCount: { type: Number, default: 0 },
  coverImage: { type: String, required: true },
  location: { type: String, required: true },
  isEmergency: { type: Boolean, default: false },
  category: { type: String, default: 'Food Relief' },
  status: { type: String, enum: ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

// 6. Donation Model (Strict min: 20 INR)
const DonationSchema = new Schema({
  id: { type: String },
  donationId: { type: String, required: true, unique: true },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPhone: { type: String },
  amount: { type: Number, required: true, min: 20 },
  campaignId: { type: String },
  campaignTitle: { type: String },
  paymentMethod: { type: String, default: 'UPI' },
  status: { type: String, default: 'Successful' },
  transactionId: { type: String },
  isAnonymous: { type: Boolean, default: false },
  recurringFrequency: { type: String, default: 'None' },
  collectedBy: { type: String },
  receiptNote: { type: String },
  verifiedBy: { type: String },
  verifiedAt: { type: Schema.Types.Mixed }
}, { timestamps: true });

// 7. Payment Model
const PaymentSchema = new Schema({
  paymentId: { type: String, required: true, unique: true },
  donationId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

// 8. Payment QR Model
const PaymentQRSchema = new Schema({
  qrId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  upiId: { type: String, required: true },
  accountName: { type: String, required: true },
  location: { type: String, required: true },
  qrImageUrl: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Active', 'Rejected', 'Expired', 'Disabled'], default: 'Pending' }
}, { timestamps: true });

// 9. Food Donation Model
const FoodDonationSchema = new Schema({
  donorName: { type: String, required: true },
  donorPhone: { type: String, required: true },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  estimatedServings: { type: Number, required: true },
  preparedAt: { type: Date, required: true },
  safeUntil: { type: Date, required: true },
  dietaryCategory: { type: String, default: 'Vegetarian' },
  packaging: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  pickupTime: { type: String, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

// 10. Food Inventory Model
const FoodInventorySchema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: 'Available' }
}, { timestamps: true });

// 11. Distribution Event Model
const DistributionEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  campaignTitle: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  volunteersAssigned: [{ type: String }],
  mealsDistributed: { type: Number, default: 0 },
  beneficiariesCount: { type: Number, default: 0 },
  proofPhotos: [{ type: String }],
  status: { type: String, default: 'Verified' },
  notes: { type: String }
}, { timestamps: true });

// 12. Distribution Record Model
const DistributionRecordSchema = new Schema({
  eventId: { type: String, required: true },
  beneficiaryId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// 13. Task Model
const TaskSchema = new Schema({
  taskId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'Open' }
}, { timestamps: true });

// 14. Notification Model
const NotificationSchema = new Schema({
  recipientEmail: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

// 15. Notification Preference Model
const NotificationPreferenceSchema = new Schema({
  userEmail: { type: String, required: true, unique: true },
  donationReceipts: { type: Boolean, default: true }
});

// 16. Committee Member Model
const CommitteeMemberSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  bio: { type: String, required: true },
  responsibilities: { type: String, required: true },
  photo: { type: String, required: true }
}, { timestamps: true });

// 17. Complaint Model
const ComplaintSchema = new Schema({
  ticketId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

// 18. Expense Model
const ExpenseSchema = new Schema({
  id: { type: String },
  expenseId: { type: String },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  campaignTitle: { type: String, required: true },
  date: { type: Schema.Types.Mixed, required: true },
  description: { type: String, required: true },
  approvedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

// 19. Report Model
const ReportSchema = new Schema({
  reportType: { type: String, required: true },
  period: { type: String, required: true }
});

// 20. Audit Log Model
const AuditLogSchema = new Schema({
  user: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// 21. Success Story Model
const SuccessStorySchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  beneficiaryName: { type: String, required: true },
  location: { type: String, required: true },
  summary: { type: String, required: true },
  impactText: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: String }
}, { timestamps: true });

// 22. Setting Model
const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed }
});

// 23. How It Works Step Model
const HowItWorksSchema = new Schema({
  id: { type: String, unique: true },
  number: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  badge: { type: String, default: 'Digitally Verified' }
}, { timestamps: true });

// 24. FAQ Model
const FAQSchema = new Schema({
  id: { type: String, unique: true },
  q: { type: String, required: true },
  a: { type: String, required: true },
  category: { type: String, default: 'General' }
}, { timestamps: true });

// 25. Right Hero Visual Card Model
const RightHeroCardSchema = new Schema({
  id: { type: String, unique: true },
  badgeText: { type: String, default: 'Live Field Dispatch' },
  timeAgo: { type: String, default: '12 mins ago' },
  title: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  raisedAmount: { type: Number, default: 0 },
  goalAmount: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 },
  impactCardTag: { type: String, default: 'Direct Impact' },
  impactCardText: { type: String, default: '₹20 = 1 Nourishing Meal' },
  impactCardIcon: { type: String, default: '✓' },
  showImpactCard: { type: Boolean, default: true },
  volunteerCardTag: { type: String, default: 'Volunteers' },
  volunteerCardText: { type: String, default: '840+ Active on Field' },
  volunteerCardIcon: { type: String, default: '★' },
  showVolunteerCard: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

function getOrCreateModel(modelName: string, schema: Schema): any {
  if ((mongoose.models as any)[modelName]) {
    return (mongoose.models as any)[modelName];
  }
  return (mongoose as any).model(modelName, schema);
}

export const UserModel: any = getOrCreateModel('User', UserSchema);
export const DonorModel: any = getOrCreateModel('Donor', DonorSchema);
export const VolunteerModel: any = getOrCreateModel('Volunteer', VolunteerSchema);
export const BeneficiaryModel: any = getOrCreateModel('Beneficiary', BeneficiarySchema);
export const CampaignModel: any = getOrCreateModel('Campaign', CampaignSchema);
export const DonationModel: any = getOrCreateModel('Donation', DonationSchema);
export const PaymentModel: any = getOrCreateModel('Payment', PaymentSchema);
export const PaymentQRModel: any = getOrCreateModel('PaymentQR', PaymentQRSchema);
export const FoodDonationModel: any = getOrCreateModel('FoodDonation', FoodDonationSchema);
export const FoodInventoryModel: any = getOrCreateModel('FoodInventory', FoodInventorySchema);
export const DistributionEventModel: any = getOrCreateModel('DistributionEvent', DistributionEventSchema);
export const DistributionRecordModel: any = getOrCreateModel('DistributionRecord', DistributionRecordSchema);
export const TaskModel: any = getOrCreateModel('Task', TaskSchema);
export const NotificationModel: any = getOrCreateModel('Notification', NotificationSchema);
export const NotificationPreferenceModel: any = getOrCreateModel('NotificationPreference', NotificationPreferenceSchema);
export const CommitteeMemberModel: any = getOrCreateModel('CommitteeMember', CommitteeMemberSchema);
export const ComplaintModel: any = getOrCreateModel('Complaint', ComplaintSchema);
export const ExpenseModel: any = getOrCreateModel('Expense', ExpenseSchema);
export const ReportModel: any = getOrCreateModel('Report', ReportSchema);
export const AuditLogModel: any = getOrCreateModel('AuditLog', AuditLogSchema);
export const SuccessStoryModel: any = getOrCreateModel('SuccessStory', SuccessStorySchema);
export const SettingModel: any = getOrCreateModel('Setting', SettingSchema);
export const HowItWorksModel: any = getOrCreateModel('HowItWorks', HowItWorksSchema);
export const FAQModel: any = getOrCreateModel('FAQ', FAQSchema);
export const RightHeroCardModel: any = getOrCreateModel('RightHeroCard', RightHeroCardSchema);

