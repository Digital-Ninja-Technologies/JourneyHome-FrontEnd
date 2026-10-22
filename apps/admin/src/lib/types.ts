export type PlanStatus =
  | "Pending"
  | "Active"
  | "Payment_Due"
  | "Overdue"
  | "Paused"
  | "Service_Request"
  | "Under_Review"
  | "Approved"
  | "Service_Scheduled"
  | "Completed"
  | "Cancelled"
  | "Expired";

export interface CoveredPerson {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  relationship: string;
  address: string;
  phoneNumber?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
}

export interface Plan {
  _id: string;
  owner: string;
  coveredPerson: CoveredPerson;
  packageSnapshot: { name: string };
  contributionAmountMinor: number;
  currency: string;
  startDate: string;
  nextPaymentDate: string;
  totalContributedMinor: number;
  status: PlanStatus;
  lastPaymentAt?: string;
  createdAt: string;
}

export type RequestStatus =
  | "Submitted"
  | "Under_Review"
  | "More_Info_Required"
  | "Docs_Verified"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface ServiceRequest {
  _id: string;
  owner: string;
  plan: string;
  coveredPersonSnapshot: CoveredPerson;
  dateOfDeath: string;
  burialLocation: string;
  expectedBurialDate: string;
  contactPerson: string;
  contactPhone: string;
  additionalInformation?: string;
  status: RequestStatus;
  rejectionReason?: string;
  moreInfoReason?: string;
  verifiedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export interface ServiceDocument {
  _id: string;
  documentType: "Death_Certificate" | "Valid_Identification" | "Other_Proof";
  verificationStatus: "Pending" | "Approved" | "Requires_Resubmission";
  rejectionReason?: string;
  uploadedAt: string;
  replacedBy?: string;
}

export interface Package {
  _id: string;
  name: string;
  description: string;
  photographyIncluded: boolean;
  videographyIncluded: boolean;
  monthlyContributionMinor: number;
  currency: string;
  isActive: boolean;
}

export type PaymentStatus =
  | "Pending"
  | "Processing"
  | "Successful"
  | "Failed"
  | "Refunded"
  | "Cancelled";

export interface AdminPayment {
  _id: string;
  owner: string;
  plan: string;
  /** Optional display names, so the screen doesn't depend on looking up every owner/plan. */
  ownerName?: string;
  planName?: string;
  reference: string;
  amountMinor: number;
  currency: string;
  purpose: "initial_contribution" | "recurring_contribution";
  status: PaymentStatus;
  createdAt: string;
  processedAt?: string;
}

export interface AuditEntry {
  _id: string;
  actor?: string;
  actorName?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceLabel?: string;
  createdAt: string;
}

export interface AdminMe {
  id: string;
  name: string;
  email: string;
  preferences: {
    newServiceRequest: boolean;
    paymentFailed: boolean;
    weeklyDigest: boolean;
  };
}
