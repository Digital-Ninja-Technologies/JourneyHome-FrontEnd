import { z } from "zod";
import { PlanStatusEnum } from "./enums";

export const coveredPersonSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  relationship: z.string().trim().min(1, "Relationship is required"),
  address: z.string().trim().min(3, "Home address is required"),
  phoneNumber: z.string().trim().optional(),
});
export type CoveredPerson = z.infer<typeof coveredPersonSchema>;

export const planPackageSnapshotSchema = z.object({
  name: z.string(),
  monthlyContributionMinor: z.number().optional(),
});
export type PlanPackageSnapshot = z.infer<typeof planPackageSnapshotSchema>;

export const planSchema = z.object({
  _id: z.string(),
  owner: z.string().optional(),
  coveredPerson: coveredPersonSchema,
  packageSnapshot: planPackageSnapshotSchema,
  contributionAmountMinor: z.number(),
  currency: z.string().default("NGN"),
  startDate: z.string(),
  nextPaymentDate: z.string(),
  totalContributedMinor: z.number(),
  status: PlanStatusEnum,
  lastPaymentAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Plan = z.infer<typeof planSchema>;

export const createPlanSchema = z.object({
  packageId: z.string().min(1, "Please select a package"),
  coveredPerson: coveredPersonSchema,
  contributionAmountMinor: z.number().positive("Contribution amount must be greater than zero"),
  currency: z.string().default("NGN"),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanStatusSchema = z.object({
  status: PlanStatusEnum,
});
export type UpdatePlanStatusInput = z.infer<typeof updatePlanStatusSchema>;
