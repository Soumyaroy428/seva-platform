# SEVA Platform — Database Schema & Data Models

> **Document Type:** Database Architecture & Data Dictionary  
> **Platform Version:** 1.0.0 | **Database Engine:** MongoDB (via Mongoose 8.7)  
> **Location in Codebase:** `server/src/models/index.ts`

---

## 1. Overview

The SEVA Platform database architecture is designed with **25 distinct collections** supporting donors, volunteers, beneficiaries, campaigns, ground distributions, surplus food rescue, and platform governance. All schemas include automatic Mongoose timestamps (`createdAt`, `updatedAt`) unless specified otherwise.

---

## 2. Comprehensive Model Catalog

### 1. `UserModel` (`users` collection)
Stores authentication credentials, user profiles, assigned roles, and volunteer application status.
| Field | Type | Required | Enum / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | No | — | Optional custom identifier |
| `name` | String | **Yes** | — | Full name of the user |
| `email` | String | **Yes** | Unique | Lowercase unique email address |
| `password` | String | **Yes** | — | Hashed/secure user password |
| `phone` | String | No | — | Mobile contact number |
| `role` | String | **Yes** | `['admin', 'donor', 'volunteer', 'beneficiary']` (default: `'donor'`) | Role assignment |
| `volunteerStatus` | String | No | `['Pending', 'Under Review', 'Approved', 'Rejected', 'Suspended']` | Approval status for volunteers |
| `volunteerId` | String | No | — | Unique issued ID (e.g., `VOL-WB-2026-9042`) |
| `area` | String | No | — | Assigned or preferred field area |
| `skills` | [String] | No | `[]` | List of volunteer capabilities |
| `availability` | String | No | — | Availability schedule (e.g. `Weekends`) |
| `avatar` | String | No | — | Profile picture or headshot URL |
| `token` | String | No | — | Session authentication token |
| `isActive` | Boolean | No | default: `true` | Account active state |

---

### 2. `DonorModel` (`donors` collection)
Aggregates donor giving statistics and recurring contribution flags.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `userId` | ObjectId | No | — | Reference to `UserModel` |
| `totalDonated` | Number | No | `0` | Cumulative amount donated in INR |
| `donationCount`| Number | No | `0` | Total number of successful donations |
| `lastDonationDate` | Date | No | — | Timestamp of most recent contribution |
| `recurringStatus` | String | No | `'None'` | Recurring status (Weekly, Monthly) |

---

### 3. `VolunteerModel` (`volunteers` collection)
Field volunteer records, verified credentials, and operational metrics.
| Field | Type | Required | Enum / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `volunteerId` | String | **Yes** | Unique | Generated volunteer badge ID |
| `name` | String | **Yes** | — | Volunteer's full name |
| `email` | String | **Yes** | — | Contact email |
| `phone` | String | **Yes** | — | Contact phone number |
| `area` | String | **Yes** | — | Field operation zone |
| `skills` | [String] | No | `[]` | Logistics, driving, first aid, etc. |
| `availability` | String | No | `'Weekends'` | Weekly time commitment |
| `status` | String | No | `['Pending', 'Under Review', 'Approved', 'Rejected', 'Suspended']` (default: `'Pending'`) | Admin review state |
| `hoursLogged` | Number | No | `0` | Field service hours recorded |
| `tasksCompleted`| Number | No | `0` | Completed missions |
| `photo` | String | No | — | Badge headshot URL |

---

### 4. `BeneficiaryModel` (`beneficiaries` collection)
Households enrolled in direct meal and ration relief.
| Field | Type | Required | Enum / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `beneficiaryId` | String | **Yes** | Unique | e.g. `SEVA-BEN-30491` |
| `name` | String | **Yes** | — | Registered beneficiary name |
| `familyHeadName` | String | No | — | Name of the household head |
| `area` | String | **Yes** | — | Residence / slum zone |
| `householdSize` | Number | No | `1` | Number of family members |
| `category` | String | No | `'Daily Wage'` | Demographic category |
| `verificationStatus` | String | No | `['Pending', 'Verified', 'Rejected', 'Inactive']` (default: `'Verified'`) | Field verification state |
| `qrToken` | String | No | — | Digital pass verification token |
| `mealsReceived`| Number | No | `0` | Total meals provided to date |

---

### 5. `CampaignModel` (`campaigns` collection)
Targeted hunger relief and disaster relief initiatives.
| Field | Type | Required | Enum / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | String | **Yes** | — | Campaign display title |
| `slug` | String | **Yes** | Unique | URL-safe slug |
| `description` | String | **Yes** | — | Detailed mission background |
| `targetAmount` | Number | **Yes** | — | Financial target in INR |
| `collectedAmount` | Number | No | `0` | Total funds raised in INR |
| `mealsSupported` | Number | No | `0` | Calculated meals funded |
| `donorCount` | Number | No | `0` | Total unique contributors |
| `coverImage` | String | **Yes** | — | Banner image URL |
| `location` | String | **Yes** | — | Operating location |
| `isEmergency` | Boolean | No | `false` | Urgent/disaster badge flag |
| `category` | String | No | `'Food Relief'` | Initiative classification |
| `status` | String | No | `['Draft', 'Active', 'Paused', 'Completed', 'Cancelled']` (default: `'Active'`) | Life-cycle state |

---

### 6. `DonationModel` (`donations` collection)
Financial contributions with strict governance and 80G tax receipt tracking.
| Field | Type | Required | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `donationId` | String | **Yes** | Unique | Serial receipt ID (`SEVA-DON-2026-XXXXXX`) |
| `donorName` | String | **Yes** | — | Donor full name or 'Kind Supporter' |
| `donorEmail` | String | **Yes** | — | Donor email for tax receipt dispatch |
| `donorPhone` | String | No | — | Contact telephone |
| `amount` | Number | **Yes** | **`min: 20`** | Contribution amount in INR |
| `campaignId` | String | No | — | Associated campaign identifier |
| `campaignTitle` | String | No | — | Name of campaign funded |
| `paymentMethod` | String | No | `'UPI'` | `UPI`, `QR`, `Card`, `Netbanking`, `Cash` |
| `status` | String | No | `'Successful'` | `Successful`, `Pending`, `Verified` |
| `transactionId` | String | No | — | Gateway or bank UTR reference |
| `isAnonymous` | Boolean | No | `false` | Privacy flag |
| `recurringFrequency` | String | No | `'None'` | `Weekly`, `Monthly`, `Quarterly` |
| `collectedBy` | String | No | — | Field volunteer name for cash donations |
| `receiptNote` | String | No | — | Audit verification remarks |

---

### 7. `PaymentModel` (`payments` collection)
Low-level transaction logs tying donations to payment provider records.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `paymentId` | String | **Yes** | Unique transaction identifier |
| `donationId` | String | **Yes** | Reference to `DonationModel.donationId` |
| `amount` | Number | **Yes** | Captured amount in INR |
| `status` | String | **Yes** | Transaction status |

---

### 8. `PaymentQRModel` (`paymentqrs` collection)
Anti-fraud managed UPI QR codes uploaded for public donation scanning.
| Field | Type | Required | Enum / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `qrId` | String | **Yes** | Unique | QR code ID (e.g., `QR-1`) |
| `title` | String | **Yes** | — | Account description / Campaign label |
| `upiId` | String | **Yes** | — | Valid UPI ID (e.g. `seva.relief@okaxis`) |
| `accountName` | String | **Yes** | — | Official bank beneficiary name |
| `location` | String | **Yes** | — | Physical branch or dispatch center |
| `qrImageUrl` | String | **Yes** | — | Image URL of QR barcode |
| `uploadedBy` | String | **Yes** | — | Submitting staff or volunteer |
| `status` | String | No | `['Pending', 'Active', 'Rejected', 'Expired', 'Disabled']` (default: `'Pending'`) | Review status (must be `'Active'` to show) |

---

### 9. `FoodDonationModel` (`fooddonations` collection)
Surplus food rescue intake from caterers, restaurants, and event organizers.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `donorName` | String | **Yes** | Donor or organization name |
| `donorPhone` | String | **Yes** | Contact telephone for pickup dispatch |
| `foodType` | String | **Yes** | Food description (e.g., Cooked Rice & Dal) |
| `quantity` | String | **Yes** | Bulk quantity description |
| `estimatedServings` | Number | **Yes** | Portion count |
| `preparedAt` | Date | **Yes** | Preparation timestamp |
| `safeUntil` | Date | **Yes** | **Expiration safety cutoff timestamp** |
| `dietaryCategory` | String | No | `Vegetarian`, `Non-Vegetarian`, `Jain` |
| `packaging` | String | **Yes** | `Sealed Containers`, `Disposable Trays` |
| `pickupLocation` | String | **Yes** | Full street address for relief van |
| `pickupTime` | String | **Yes** | Requested pickup window |
| `status` | String | No | `Pending`, `Assigned`, `Collected`, `Distributed` |

---

### 10. `FoodInventoryModel` (`foodinventories` collection)
Warehouse and community kitchen ingredient stockpile records.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `itemName` | String | **Yes** | — | Item title (Rice, Lentils, Cooking Oil) |
| `quantity` | Number | **Yes** | — | Current stock in kg/liters |
| `status` | String | No | `'Available'` | Availability condition |

---

### 11. `DistributionEventModel` (`distributionevents` collection)
On-the-ground food relief distribution drives.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `eventId` | String | **Yes** | Unique drive identifier |
| `campaignTitle` | String | **Yes** | Supporting campaign |
| `location` | String | **Yes** | Distribution location |
| `date` | Date | **Yes** | Event execution date |
| `volunteersAssigned` | [String] | No | List of participating volunteer names |
| `mealsDistributed` | Number | No | Number of meals handed out |
| `beneficiariesCount` | Number | No | Recipient individuals served |
| `proofPhotos` | [String] | No | Field photographic proof URLs |
| `status` | String | No | `Verified`, `Pending Verification` |
| `notes` | String | No | Operational remarks |

---

### 12. `DistributionRecordModel` (`distributionrecords` collection)
Individual beneficiary pass scans tied to specific distribution drives.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `eventId` | String | **Yes** | — | Reference to `DistributionEventModel.eventId` |
| `beneficiaryId` | String | **Yes** | — | Reference to `BeneficiaryModel.beneficiaryId` |
| `timestamp` | Date | No | `Date.now` | Precise time of scan |

---

### 13. `TaskModel` (`tasks` collection)
Operational task tickets assigned to volunteers.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `taskId` | String | **Yes** | — | Unique task identifier |
| `title` | String | **Yes** | — | Mission or assignment title |
| `type` | String | **Yes** | — | `Packaging`, `Transit`, `Dispatch` |
| `status` | String | No | `'Open'` | `Open`, `In Progress`, `Completed` |

---

### 14. `NotificationModel` (`notifications` collection)
Dispatched notification messages.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `recipientEmail` | String | **Yes** | Target recipient email address |
| `title` | String | **Yes** | Subject / Headline |
| `message` | String | **Yes** | Notification text content |

---

### 15. `NotificationPreferenceModel` (`notificationpreferences` collection)
User communication preference settings.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `userEmail` | String | **Yes** | Unique | User email address |
| `donationReceipts` | Boolean | No | `true` | Automated email receipt toggle |

---

### 16. `CommitteeMemberModel` (`committeemembers` collection)
Board of trustees and operational leadership profiles displayed publicly.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | No | Unique identifier |
| `name` | String | **Yes** | Full legal name |
| `designation` | String | **Yes** | Official role (e.g. Managing Trustee) |
| `bio` | String | **Yes** | Professional & humanitarian background |
| `responsibilities` | String | **Yes** | Scope of oversight |
| `photo` | String | **Yes** | High-resolution headshot URL |

---

### 17. `ComplaintModel` (`complaints` collection)
Grievance and complaint ticketing system.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ticketId` | String | **Yes** | Unique ticket reference |
| `userEmail` | String | **Yes** | Submitting user email |
| `description` | String | **Yes** | Detailed grievance description |

---

### 18. `ExpenseModel` (`expenses` collection)
Transparent financial audit ledger.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` / `expenseId`| String | No | Internal identifier |
| `amount` | Number | **Yes** | Expenditure amount in INR |
| `category` | String | **Yes** | `Grain & Food Procurement`, `Packaging & Hygiene`, etc. |
| `campaignTitle` | String | **Yes** | Associated initiative |
| `date` | Mixed | **Yes** | Date incurred |
| `description` | String | **Yes** | Detailed purpose |
| `approvedBy` | String | No | Name of authorized auditor / admin |

---

### 19. `ReportModel` (`reports` collection)
Published compliance, tax (80G), and operational reports.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `reportType` | String | **Yes** | Annual, Quarterly, Audit |
| `period` | String | **Yes** | Reporting time interval |

---

### 20. `AuditLogModel` (`auditlogs` collection)
Immutable historical audit trail for platform actions.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user` | String | **Yes** | — | Name or email of acting administrator/volunteer |
| `action` | String | **Yes** | — | `Approved QR`, `Created Campaign`, `Updated Metrics` |
| `entity` | String | **Yes** | — | Affected entity type (`PaymentQR`, `Campaign`) |
| `details` | String | **Yes** | — | Specific change notes or diff |
| `timestamp` | Date | No | `Date.now` | Exact event timestamp |

---

### 21. `SuccessStoryModel` (`successstories` collection)
Beneficiary impact stories.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | No | Story identifier |
| `title` | String | **Yes** | Narrative headline |
| `beneficiaryName` | String | **Yes** | Individual or family name |
| `location` | String | **Yes** | Neighborhood / village |
| `summary` | String | **Yes** | Story overview |
| `impactText` | String | **Yes** | Quantified result |
| `image` | String | **Yes** | Verified photo URL |
| `date` | String | No | Story publishing date |

---

### 22. `SettingModel` (`settings` collection)
Key-value pair settings for platform-wide dynamic variables.
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `key` | String | **Yes** (Unique) | Config key (e.g. `site_settings`, `announcement`) |
| `value` | Mixed | No | Serialized configuration object |

---

### 23. `HowItWorksModel` (`howitworks` collection)
Step-by-step visual workflow on the landing page.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | No | — | Step ID |
| `number` | String | **Yes** | — | Step order (`01`, `02`, `03`, `04`) |
| `title` | String | **Yes** | — | Step headline |
| `desc` | String | **Yes** | — | Detailed explanation |
| `badge` | String | No | `'Digitally Verified'` | Quality indicator badge |

---

### 24. `FAQModel` (`faqs` collection)
Categorized question and answer pairs.
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | No | — | FAQ ID |
| `q` | String | **Yes** | — | Question text |
| `a` | String | **Yes** | — | Answer markdown/text |
| `category` | String | No | `'General'` | `General`, `Tax & 80G`, `Food Safety`, etc. |

---

### 25. `RightHeroCardModel` (`rightherocards` collection)
Dynamic visual card rendered in the right column of the landing page hero section.
| Field | Type | Required | Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | No | — | Card ID |
| `title` | String | **Yes** | — | Headline |
| `badgeText` | String | No | `'Live Field Dispatch'` | Top status badge |
| `timeAgo` | String | No | `'12 mins ago'` | Relative time badge |
| `imageUrl` | String | No | `''` | Field dispatch photograph URL |
| `raisedAmount` | Number | No | `0` | Live raised amount in INR |
| `goalAmount` | Number | No | `0` | Goal amount in INR |
| `progressPercentage` | Number | No | `0` | Percentage completion |
| `impactCardTag` | String | No | `'Direct Impact'` | Tag for direct impact pill |
| `impactCardText` | String | No | `'₹20 = 1 Nourishing Meal'` | Impact statement |
| `volunteerCardTag` | String | No | `'Volunteers'` | Tag for volunteer pill |
| `volunteerCardText`| String | No | `'840+ Active on Field'` | Volunteer counter |
| `showImpactCard` | Boolean | No | `true` | Visibility toggle |
| `showVolunteerCard`| Boolean | No | `true` | Visibility toggle |
| `isActive` | Boolean | No | `true` | Card active toggle |
| `updatedBy` | String | No | `'Admin'` | Last modifier |

