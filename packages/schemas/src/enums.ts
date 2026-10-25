import { z } from "zod";

export const PlanStatusEnum = z.enum([
  "Pending",
  "Active",
  "Payment_Due",
  "Overdue",
  "Paused",
  "Service_Request",
  "Under_Review",
  "Approved",
  "Service_Scheduled",
  "Completed",
  "Cancelled",
  "Expired",
]);
export type PlanStatus = z.infer<typeof PlanStatusEnum>;

export const PaymentStatusEnum = z.enum([
  "Pending",
  "Processing",
  "Successful",
  "Failed",
  "Refunded",
  "Cancelled",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const ServiceRequestStatusEnum = z.enum([
  "Submitted",
  "Under_Review",
  "More_Info_Required",
  "Docs_Verified",
  "Approved",
  "Rejected",
  "Cancelled",
]);
export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusEnum>;

export const DocumentTypeEnum = z.enum([
  "Death_Certificate",
  "Valid_Identification",
  "Other_Proof",
]);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const DocumentVerificationStatusEnum = z.enum([
  "Pending",
  "Approved",
  "Requires_Resubmission",
]);
export type DocumentVerificationStatus = z.infer<
  typeof DocumentVerificationStatusEnum
>;

export const UserRoleEnum = z.enum(["customer", "admin", "super_admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const PaymentPurposeEnum = z.enum([
  "initial_contribution",
  "recurring_contribution",
]);
export type PaymentPurpose = z.infer<typeof PaymentPurposeEnum>;
