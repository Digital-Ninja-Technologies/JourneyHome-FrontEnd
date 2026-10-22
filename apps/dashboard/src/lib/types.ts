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

export type PaymentStatus =
  | "Pending"
  | "Processing"
  | "Successful"
  | "Failed"
  | "Refunded"
  | "Cancelled";

export interface CoveredPerson {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  relationship: string;
  address: string;
  phoneNumber?: string;
}

export interface Plan {
  _id: string;
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
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  plan: string;
  amountMinor: number;
  currency: string;
  purpose: "initial_contribution" | "recurring_contribution";
  status: PaymentStatus;
  reference?: string;
  failureMessage?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Package {
  _id: string;
  name: string;
  photographyIncluded: boolean;
  videographyIncluded: boolean;
  monthlyContributionMinor: number;
  currency: string;
}

export type ServiceRequestStatus =
  | "Submitted"
  | "Under_Review"
  | "More_Info_Required"
  | "Docs_Verified"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type DocumentType =
  | "Death_Certificate"
  | "Valid_Identification"
  | "Other_Proof";

export interface ServiceRequest {
  _id: string;
  plan: string;
  coveredPersonSnapshot: CoveredPerson;
  dateOfDeath: string;
  burialLocation: string;
  expectedBurialDate: string;
  contactPerson: string;
  contactPhone: string;
  additionalInformation?: string;
  status: ServiceRequestStatus;
  rejectionReason?: string;
  moreInfoReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDocument {
  _id: string;
  documentType: DocumentType;
  verificationStatus: "Pending" | "Approved" | "Requires_Resubmission";
  rejectionReason?: string;
  uploadedAt: string;
  replacedBy?: string;
}

export interface AppNotification {
  _id: string;
  plan?: string;
  event: string;
  subject?: string;
  createdAt: string;
}
