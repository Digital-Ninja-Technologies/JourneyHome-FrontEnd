import { z } from "zod";

export const packageSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  photographyIncluded: z.boolean(),
  videographyIncluded: z.boolean(),
  coverageDetails: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  monthlyContributionMinor: z.number().positive(),
  currency: z.string().default("NGN"),
  isActive: z.boolean().optional().default(true),
});
export type Package = z.infer<typeof packageSchema>;

export const updatePackageSchema = z.object({
  monthlyContributionMinor: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
