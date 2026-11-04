import { z } from "zod";
import { PlanStatusEnum } from "./enums";

export const paginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(20),
  total: z.number().default(0),
  totalPages: z.number().default(1),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const coveredPersonSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  relationship: z.string().trim().min(1, "Relationship is required"),
  address: z.string().trim().min(3, "Home address is required"),
  phoneNumber: z.string().trim().nullable().optional(),
});
export type CoveredPerson = z.infer<typeof coveredPersonSchema>;

export const planPackageSnapshotSchema = z.object({
  name: z.string().optional().default("Standard"),
  amount: z.number().optional(),
  monthlyContributionMinor: z.number().optional(),
});
export type PlanPackageSnapshot = z.infer<typeof planPackageSnapshotSchema>;

export const planSchema = z
  .object({
    _id: z.string(),
    packageId: z.string().optional(),
    packageName: z.string().optional(),
    package: z.string().optional(),
    owner: z.string().optional(),
    ownerId: z.string().optional(),
    ownerName: z.string().optional(),
    ownerEmail: z.string().optional(),
    coveredPerson: coveredPersonSchema,
    packageSnapshot: planPackageSnapshotSchema.optional(),
    contributionAmountMinor: z.number().optional().default(0),
    totalContributedMinor: z.number().optional().default(0),
    totalContributedAmount: z.number().optional(),
    currency: z.string().default("NGN"),
    startDate: z.string().optional(),
    nextPaymentDate: z.string().nullable().optional(),
    targetAmountMinor: z.number().optional(),
    status: PlanStatusEnum,
    coverageStatus: z.string().optional(),
    lastPaymentAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .transform((p) => ({
    ...p,
    packageSnapshot: p.packageSnapshot || { name: p.packageName || "Standard" },
    contributionAmountMinor: p.contributionAmountMinor ?? 0,
    totalContributedMinor:
      p.totalContributedMinor ?? p.totalContributedAmount ?? 0,
    startDate: p.startDate ?? p.createdAt,
    nextPaymentDate: p.nextPaymentDate ?? "",
  }));
export type Plan = z.infer<typeof planSchema>;

export const paginatedPlansSchema = z.object({
  items: z.array(planSchema),
  pagination: paginationSchema.optional(),
});
export type PaginatedPlans = z.infer<typeof paginatedPlansSchema>;

export const plansListResponseSchema = z.union([
  paginatedPlansSchema.transform((r) => r.items),
  z.object({ items: z.array(planSchema) }).transform((r) => r.items),
  z.array(planSchema),
]);

export const createPlanSchema = z.object({
  packageId: z.string().min(1, "Please select a package"),
  coveredPerson: coveredPersonSchema,
  contributionAmountMinor: z.number().positive().optional(),
  currency: z.string().default("NGN").optional(),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const dashboardSummarySchema = z.object({
  totalContributedMinor: z.number().default(0),
  currentMonthPaymentCount: z.number().default(0),
  activePlanCount: z.number().default(0),
  nextPaymentDate: z.string().nullable().optional(),
  totalPlans: z.number().default(0),
  activePlans: z.number().default(0),
  pendingPlans: z.number().default(0),
  currency: z.string().default("NGN"),
  recentPlans: z.array(planSchema).default([]),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

export const updatePlanStatusSchema = z.object({
  status: PlanStatusEnum,
});
export type UpdatePlanStatusInput = z.infer<typeof updatePlanStatusSchema>;
