import {
  initialCampaigns,
  initialDonations,
  initialPaymentQRs,
  initialVolunteers,
  initialBeneficiaries,
  initialDistributions,
  initialFoodDonations,
  initialExpenses,
  initialCommitteeMembers,
  initialSuccessStories,
  initialAuditLogs
} from './mockData';
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
  IAuditLog,
  IRightHeroCard
} from '../types';

// In-memory persistent state during server runtime
class SevaStore {
  private campaigns: ICampaign[] = [...initialCampaigns];
  private donations: IDonation[] = [...initialDonations];
  private paymentQRs: IPaymentQR[] = [...initialPaymentQRs];
  private volunteers: IVolunteer[] = [...initialVolunteers];
  private beneficiaries: IBeneficiary[] = [...initialBeneficiaries];
  private distributions: IDistributionEvent[] = [...initialDistributions];
  private foodDonations: IFoodDonation[] = [...initialFoodDonations];
  private expenses: IExpense[] = [...initialExpenses];
  private committeeMembers: ICommitteeMember[] = [...initialCommitteeMembers];
  private successStories: ISuccessStory[] = [...initialSuccessStories];
  private auditLogs: IAuditLog[] = [...initialAuditLogs];
  private rightHeroCard: IRightHeroCard | null = null;


  // Campaigns
  getCampaigns(): ICampaign[] {
    return this.campaigns;
  }

  getCampaignById(id: string): ICampaign | undefined {
    return this.campaigns.find(c => c.id === id || c._id === id || c.slug === id);
  }

  createCampaign(campaign: Omit<ICampaign, 'id'>): ICampaign {
    const newCamp: ICampaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      collectedAmount: 0,
      mealsSupported: 0,
      donorCount: 0
    };
    this.campaigns.unshift(newCamp);
    this.logAudit('System Admin', 'CAMPAIGN_CREATED', 'Campaign', `Created campaign: ${newCamp.title}`);
    return newCamp;
  }

  // Donations (Strict ₹20 minimum verification)
  getDonations(): IDonation[] {
    return this.donations;
  }

  createDonation(donationData: {
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    campaignId?: string;
    campaignTitle?: string;
    paymentMethod: IDonation['paymentMethod'];
    transactionId?: string;
    isAnonymous?: boolean;
    recurringFrequency?: IDonation['recurringFrequency'];
  }): IDonation {
    if (donationData.amount < 20) {
      throw new Error('Minimum donation amount is ₹20. Submission rejected.');
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const donationId = `SEVA-DON-${year}-${randomNum}`;

    const newDonation: IDonation = {
      id: `don-${Date.now()}`,
      donationId,
      donorName: donationData.isAnonymous ? 'Kind Anonymous Supporter' : donationData.donorName,
      donorEmail: donationData.donorEmail,
      donorPhone: donationData.donorPhone,
      amount: donationData.amount,
      campaignId: donationData.campaignId,
      campaignTitle: donationData.campaignTitle || 'General Hunger Relief & Kitchen Support',
      paymentMethod: donationData.paymentMethod,
      status: 'Successful',
      transactionId: donationData.transactionId || `TXN-${Date.now()}`,
      isAnonymous: donationData.isAnonymous || false,
      recurringFrequency: donationData.recurringFrequency || 'None',
      createdAt: new Date().toISOString()
    };

    this.donations.unshift(newDonation);

    // Update campaign metrics if connected
    if (donationData.campaignId) {
      const targetCamp = this.getCampaignById(donationData.campaignId);
      if (targetCamp) {
        targetCamp.collectedAmount += donationData.amount;
        targetCamp.donorCount += 1;
        // Each ₹25 roughly translates to 1 full hot meal
        targetCamp.mealsSupported += Math.floor(donationData.amount / 25);
      }
    }

    this.logAudit(
      donationData.donorEmail,
      'DONATION_SUCCESS',
      'Donation',
      `Processed ₹${donationData.amount} (ID: ${donationId}) via ${donationData.paymentMethod}`
    );

    return newDonation;
  }

  // Payment QRs
  getPaymentQRs(): IPaymentQR[] {
    return this.paymentQRs;
  }

  getActivePaymentQRs(): IPaymentQR[] {
    return this.paymentQRs.filter(qr => qr.status === 'Active');
  }

  addPaymentQR(qr: Omit<IPaymentQR, 'id' | 'qrId' | 'status' | 'createdAt'>): IPaymentQR {
    const newQR: IPaymentQR = {
      ...qr,
      id: `qr-${Date.now()}`,
      qrId: `QR-UPLOAD-${Date.now().toString().slice(-4)}`,
      status: 'Pending', // Requires Admin Approval
      createdAt: new Date().toISOString()
    };
    this.paymentQRs.push(newQR);
    this.logAudit(qr.uploadedBy, 'QR_UPLOADED', 'PaymentQR', `Submitted QR ${newQR.title} for approval`);
    return newQR;
  }

  approvePaymentQR(qrId: string, approvedBy: string): boolean {
    const qr = this.paymentQRs.find(q => q.id === qrId || q.qrId === qrId);
    if (qr) {
      qr.status = 'Active';
      this.logAudit(approvedBy, 'QR_APPROVED', 'PaymentQR', `Approved QR ${qr.qrId} for public donations`);
      return true;
    }
    return false;
  }

  rejectPaymentQR(qrId: string, rejectedBy: string): boolean {
    const qr = this.paymentQRs.find(q => q.id === qrId || q.qrId === qrId);
    if (qr) {
      qr.status = 'Rejected';
      this.logAudit(rejectedBy, 'QR_REJECTED', 'PaymentQR', `Rejected QR ${qr.qrId}`);
      return true;
    }
    return false;
  }

  // Food Donations
  getFoodDonations(): IFoodDonation[] {
    return this.foodDonations;
  }

  createFoodDonation(foodData: Omit<IFoodDonation, 'id' | 'status'>): IFoodDonation {
    const newFD: IFoodDonation = {
      ...foodData,
      id: `fd-${Date.now()}`,
      status: 'Pending'
    };
    this.foodDonations.unshift(newFD);
    this.logAudit(foodData.donorName, 'FOOD_DONATION_SUBMITTED', 'FoodDonation', `Submitted ${foodData.estimatedServings} servings of ${foodData.foodType}`);
    return newFD;
  }

  // Volunteers
  getVolunteers(): IVolunteer[] {
    return this.volunteers;
  }

  registerVolunteer(data: Omit<IVolunteer, 'id' | 'volunteerId' | 'status' | 'hoursLogged' | 'tasksCompleted' | 'joinedDate'>): IVolunteer {
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
    this.logAudit(data.email, 'VOLUNTEER_REGISTERED', 'Volunteer', `New volunteer application: ${data.name}`);
    return newVol;
  }

  updateVolunteerStatus(volunteerId: string, status: IVolunteer['status'], adminUser: string): boolean {
    const vol = this.volunteers.find(v => v.id === volunteerId || v.volunteerId === volunteerId);
    if (vol) {
      vol.status = status;
      this.logAudit(adminUser, 'VOLUNTEER_STATUS_UPDATED', 'Volunteer', `Changed status of ${vol.volunteerId} to ${status}`);
      return true;
    }
    return false;
  }

  // Beneficiaries
  getBeneficiaries(): IBeneficiary[] {
    return this.beneficiaries;
  }

  registerBeneficiary(data: Omit<IBeneficiary, 'id' | 'beneficiaryId' | 'verificationStatus' | 'mealsReceived'>): IBeneficiary {
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
    this.logAudit('staff@seva.org', 'BENEFICIARY_ENROLLED', 'Beneficiary', `Enrolled beneficiary: ${data.name} (${newBen.beneficiaryId})`);
    return newBen;
  }

  // Distributions
  getDistributions(): IDistributionEvent[] {
    return this.distributions;
  }

  createDistribution(data: Omit<IDistributionEvent, 'id' | 'eventId' | 'status'>): IDistributionEvent {
    const year = new Date().getFullYear();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const newDist: IDistributionEvent = {
      ...data,
      id: `dist-${Date.now()}`,
      eventId: `SEVA-DIST-${year}-${randomCode}`,
      status: 'Verified'
    };
    this.distributions.unshift(newDist);
    this.logAudit('operations@seva.org', 'DISTRIBUTION_RECORDED', 'DistributionEvent', `Recorded distribution of ${data.mealsDistributed} meals at ${data.location}`);
    return newDist;
  }

  // Expenses & Transparency
  getExpenses(): IExpense[] {
    return this.expenses;
  }

  addExpense(data: Omit<IExpense, 'id'>): IExpense {
    const newExp: IExpense = {
      ...data,
      id: `exp-${Date.now()}`
    };
    this.expenses.unshift(newExp);
    this.logAudit(data.approvedBy, 'EXPENSE_LOGGED', 'Expense', `Logged ₹${data.amount} for ${data.category}`);
    return newExp;
  }

  // Governance & Content
  getCommitteeMembers(): ICommitteeMember[] {
    return this.committeeMembers;
  }

  getSuccessStories(): ISuccessStory[] {
    return this.successStories;
  }

  getAuditLogs(): IAuditLog[] {
    return this.auditLogs;
  }

  logAudit(user: string, action: string, entity: string, details: string) {
    const log: IAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      action,
      entity,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.auditLogs.unshift(log);
  }

  // Right Hero Visual Cards
  getRightHeroCard(): IRightHeroCard | null {
    return this.rightHeroCard;
  }

  saveRightHeroCard(data: Partial<IRightHeroCard>): IRightHeroCard {
    this.rightHeroCard = {
      ...this.rightHeroCard,
      ...data,
      id: this.rightHeroCard?.id || 'hero-visual-card-primary',
      title: data.title !== undefined ? data.title : (this.rightHeroCard?.title || '')
    };
    return this.rightHeroCard;
  }

  deleteRightHeroCard(): boolean {
    this.rightHeroCard = null;
    return true;
  }

  // Platform Aggregate KPIs
  getGlobalStats() {
    const totalDonated = this.donations.reduce((acc, curr) => acc + curr.amount, 0);
    const totalMealsServed = this.distributions.reduce((acc, curr) => acc + curr.mealsDistributed, 0) + 125000;
    const totalPeopleHelped = this.beneficiaries.reduce((acc, curr) => acc + curr.householdSize, 0) + 48200;
    const activeVolunteersCount = this.volunteers.filter(v => v.status === 'Approved').length + 840;
    const totalDistributionsCount = this.distributions.length + 312;

    return {
      totalDonated,
      totalMealsServed,
      totalPeopleHelped,
      activeVolunteersCount,
      totalDistributionsCount,
      activeCampaignsCount: this.campaigns.filter(c => c.status === 'Active').length
    };
  }
}

// Global Singleton for in-memory persistence across Hot-Reload in Next.js
declare global {
  var sevaStore: SevaStore | undefined;
}

export const store = global.sevaStore || new SevaStore();

if (process.env.NODE_ENV !== 'production') {
  global.sevaStore = store;
}
