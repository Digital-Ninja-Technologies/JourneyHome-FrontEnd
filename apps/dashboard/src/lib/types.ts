export type PlanStatus =
  | "Pending" | "Active" | "Payment_Due" | "Overdue" | "Paused" | "Service_Request" | "Under_Review"
  | "Approved" | "Service_Scheduled" | "Completed" | "Cancelled" | "Expired";

export type PaymentStatus = "Pending" | "Processing" | "Successful" | "Failed" | "Refunded" | "Cancelled";

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
