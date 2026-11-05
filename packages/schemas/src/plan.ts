import { z } from "zod";
import { PlanStatusEnum } from "./enums";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";
import { userSummarySchema } from "./user";

/**
 * Covered person schema aligned with OpenAPI components.schemas.CoveredPerson.
 */
export const coveredPersonSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  relationship: z.string().trim().min(1, "Relationship is required"),
  address: z.string().trim().min(1, "Address is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
});
export type CoveredPerson = z.infer<typeof coveredPersonSchema>;

/**
 * Package snapshot details embedded in a plan.
 * Aligned with OpenAPI components.schemas.PackageDetails.
 */
export const packageDetailsSchema = z.object({
  packageId: z.string(),
  name: z.string(),
  description: z.string().optional().default(""),
  features: z.array(z.string()).default([]),
  amount: z.number().int(),
  currency: z.string().default("NGN"),
});
export type PackageDetails = z.infer<typeof packageDetailsSchema>;

/**
 * Customer plan schema.
 * Aligned with OpenAPI components.schemas.Plan.
 */
export const planSchema = z.object({
  _id: z.string(),
  owner: z.string(),
  package: z.string(),
  packageDetails: packageDetailsSchema,
  coveredPerson: coveredPersonSchema,
  amount: z.number().int(),
  currency: z.string().default("NGN"),
  billingInterval: z.string().default("monthly"),
  startDate: z.string(),
  totalContributedAmount: z.number().int().default(0),
  status: PlanStatusEnum,
  coverageStatus: z.string().default("Pending"),
  nextPaymentDate: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});
export type Plan = z.infer<typeof planSchema>;

/**
 * Admin plan schema where owner is populated with UserSummary.
 * Aligned with OpenAPI components.schemas.AdminPlan.
 */
export const adminPlanSchema = planSchema.extend({
  owner: userSummarySchema,
});
export type AdminPlan = z.infer<typeof adminPlanSchema>;

/**
 * Request payload for creating a plan (`POST /plans`).
 */
export const createPlanSchema = z.object({
  packageId: z.string().min(1, "Please select a package"),
  coveredPerson: coveredPersonSchema,
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

/**
 * Dashboard summary returned by `GET /plans/summary`.
 * Aligned with OpenAPI components.schemas.DashboardSummary.
 */
export const dashboardSummarySchema = z.object({
  totalContributed: z.number().int().default(0),
  paymentCount: z.number().int().default(0),
  activePlans: z.number().int().default(0),
  nextPaymentDate: z.string().nullable().optional(),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

/**
 * Query schema for `GET /plans`.
 */
export const planQuerySchema = paginationQuerySchema.extend({
  name: z.string().optional(),
  status: PlanStatusEnum.optional(),
});
export type PlanQueryInput = z.infer<typeof planQuerySchema>;

/**
 * Paginated plans result schema.
 */
export const paginatedPlansSchema = createPaginatedDataSchema(planSchema);
export type PaginatedPlans = z.infer<typeof paginatedPlansSchema>;

/**
 * Paginated admin plans result schema.
 */
export const paginatedAdminPlansSchema =
  createPaginatedDataSchema(adminPlanSchema);
export type PaginatedAdminPlans = z.infer<typeof paginatedAdminPlansSchema>;
