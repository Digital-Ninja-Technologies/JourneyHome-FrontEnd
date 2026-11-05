import { z } from "zod";

/**
 * Public package shape returned by `GET /packages`.
 * Amounts are in minor units (1000000 = ₦10,000).
 * Aligned with OpenAPI components.schemas.Package.
 */
export const packageSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  features: z.array(z.string()).default([]),
  amount: z.number().int().positive(),
  currency: z.string().default("NGN"),
  billingInterval: z.literal("monthly").default("monthly"),
  isActive: z.boolean().default(true),
});
export type Package = z.infer<typeof packageSchema>;

/**
 * Full package record for admin operations.
 * Aligned with OpenAPI components.schemas.AdminPackage.
 */
export const adminPackageSchema = packageSchema.extend({
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),
});
export type AdminPackage = z.infer<typeof adminPackageSchema>;

/**
 * Input schema for creating a new package (admin).
 * Note: `amount` is supplied in major currency units (10000 = ₦10,000).
 */
export const createPackageSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  currency: z.string().default("NGN"),
  billingInterval: z.literal("monthly").default("monthly"),
  isActive: z.boolean().optional().default(true),
});
export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = createPackageSchema.partial();
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
