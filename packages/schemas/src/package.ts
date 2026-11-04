import { z } from "zod";

export const packageSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional().default(""),
  features: z.array(z.string()).default([]),
  amount: z.number().int().positive(),
  currency: z.string().default("NGN"),
  billingInterval: z.string().default("monthly"),
  isActive: z.boolean().default(true),
});

export type Package = z.infer<typeof packageSchema>;

export const packagesListResponseSchema = z.union([
  z.array(packageSchema),
  z.object({ data: z.array(packageSchema) }).transform((r) => r.data),
  z.object({ items: z.array(packageSchema) }).transform((r) => r.items),
]);

export const createPackageSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("NGN"),
  billingInterval: z.string().default("monthly"),
  isActive: z.boolean().optional().default(true),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  billingInterval: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
