import {
  PaymentStatusEnum,
  PlanStatusEnum,
  redirectSearchSchema,
  ServiceRequestStatusEnum,
  sanitizeRedirect,
} from "@journeyhome/schemas";
import { z } from "zod";

export {
  type RedirectSearch,
  redirectSearchSchema,
  sanitizeRedirect,
} from "@journeyhome/schemas";

/** Login search: an unsafe `redirect` is dropped instead of erroring the page. */
export const loginSearchSchema = redirectSearchSchema.catch({
  redirect: undefined,
});

/** Where to go after signing in: a safe in-app path, never back to /login. */
export function redirectTarget(redirect: string | undefined): string {
  const target = sanitizeRedirect(redirect, "/");
  return target.startsWith("/login") ? "/" : target;
}

export const PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 20;

const optionalString = z.string().trim().optional().catch(undefined);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

/**
 * Shared by every server-paginated table. Bad values fall back to defaults
 * instead of throwing, so a hand-edited URL never breaks the page.
 */
export const tableSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  limit: z.coerce
    .number()
    .int()
    .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
    .optional()
    .catch(undefined),
  search: optionalString,
});
export type TableSearch = z.infer<typeof tableSearchSchema>;

export const usersSearchSchema = tableSearchSchema;
export type UsersSearch = z.infer<typeof usersSearchSchema>;

export const plansSearchSchema = tableSearchSchema.extend({
  status: PlanStatusEnum.optional().catch(undefined),
});
export type PlansSearch = z.infer<typeof plansSearchSchema>;

export const paymentsSearchSchema = tableSearchSchema.extend({
  status: PaymentStatusEnum.optional().catch(undefined),
  purpose: z
    .enum(["initial_contribution", "recurring_contribution"])
    .optional()
    .catch(undefined),
  from: day,
  to: day,
});
export type PaymentsSearch = z.infer<typeof paymentsSearchSchema>;

export const serviceRequestsSearchSchema = tableSearchSchema.extend({
  status: ServiceRequestStatusEnum.optional().catch(undefined),
});
export type ServiceRequestsSearch = z.infer<typeof serviceRequestsSearchSchema>;

/** `message` holds the id of the submission open in the details sheet. */
export const contactSearchSchema = tableSearchSchema.extend({
  message: optionalString,
});
export type ContactSearch = z.infer<typeof contactSearchSchema>;

export const auditLogSearchSchema = tableSearchSchema.extend({
  actor: optionalString,
  action: optionalString,
});
export type AuditLogSearch = z.infer<typeof auditLogSearchSchema>;

export const overviewSearchSchema = z.object({
  startDate: day,
  endDate: day,
});
export type OverviewSearch = z.infer<typeof overviewSearchSchema>;
