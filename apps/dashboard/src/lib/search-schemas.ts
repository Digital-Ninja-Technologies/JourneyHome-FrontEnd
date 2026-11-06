import { z } from "zod";

export const planSearchSchema = z.object({
  plan: z.coerce.string().optional(),
  status: z.coerce.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.coerce.string().optional(),
});
export type PlanSearch = z.infer<typeof planSearchSchema>;
export const paymentsSearchSchema = planSearchSchema;
export type PaymentsSearch = PlanSearch;

export {
  type RedirectSearch,
  redirectSearchSchema,
  resolveSelectedPackage,
  type SignupSearch,
  sanitizeRedirect,
  signupSearchSchema,
  type VerifyEmailSearch,
  verifyEmailSearchSchema,
} from "@journeyhome/schemas";

export const tokenSearchSchema = z.object({
  token: z.coerce.string().optional(),
});
export type TokenSearch = z.infer<typeof tokenSearchSchema>;

export const plansSearchSchema = z.object({
  new: z.coerce.string().optional(),
  /** Package to preselect when the "new plan" dialog opens (e.g. chosen on the marketing site). */
  package: z.coerce.string().optional(),
});
export type PlansSearch = z.infer<typeof plansSearchSchema>;

export const paymentCallbackSearchSchema = z.object({
  reference: z.coerce.string().optional(),
  trxref: z.coerce.string().optional(),
});
export type PaymentCallbackSearch = z.infer<typeof paymentCallbackSearchSchema>;

export const profileSearchSchema = z.object({
  card_added: z.coerce.string().optional(),
});
export type ProfileSearch = z.infer<typeof profileSearchSchema>;
