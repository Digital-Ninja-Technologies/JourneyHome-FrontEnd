import { z } from "zod";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";
import { serviceRequestSchema } from "./service-request";

/**
 * Operations overview returned by `GET /admin/overview`.
 * All money values are minor units. Aligned with OpenAPI components.schemas.AdminOverview.
 */
export const adminOverviewSchema = z.object({
  users: z
    .object({
      total: z.number().int().default(0),
      newThisMonth: z.number().int().default(0),
    })
    .default({ total: 0, newThisMonth: 0 }),
  plans: z
    .object({
      active: z.number().int().default(0),
      overdue: z.number().int().default(0),
      pendingFirstPayment: z.number().int().default(0),
      completed: z.number().int().default(0),
    })
    .default({ active: 0, overdue: 0, pendingFirstPayment: 0, completed: 0 }),
  contributions: z
    .object({
      totalContributed: z.number().int().default(0),
      selectedPeriodContributed: z.number().int().default(0),
      monthlyContributed: z.number().int().default(0),
      monthlyCommitments: z.number().int().default(0),
      averagePerActivePlan: z.number().int().default(0),
      activePlanCount: z.number().int().default(0),
    })
    .default({
      totalContributed: 0,
      selectedPeriodContributed: 0,
      monthlyContributed: 0,
      monthlyCommitments: 0,
      averagePerActivePlan: 0,
      activePlanCount: 0,
    }),
  serviceRequests: z
    .object({
      new: z.number().int().default(0),
      inReview: z.number().int().default(0),
      awaitingCustomer: z.number().int().default(0),
      approved: z.number().int().default(0),
      closed: z.number().int().default(0),
      pendingVerification: z.number().int().default(0),
    })
    .default({
      new: 0,
      inReview: 0,
      awaitingCustomer: 0,
      approved: 0,
      closed: 0,
      pendingVerification: 0,
    }),
  needsReview: z.array(serviceRequestSchema).default([]),
  period: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .optional(),
});
export type AdminOverview = z.infer<typeof adminOverviewSchema>;

/**
 * Query for `GET /admin/overview`. Dates are `YYYY-MM-DD`.
 */
export const adminOverviewQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type AdminOverviewQueryInput = z.infer<typeof adminOverviewQuerySchema>;

export const AdminUserStatusEnum = z.enum([
  "Request_Pending",
  "Active_Plan",
  "No_Active_Plan",
]);
export type AdminUserStatus = z.infer<typeof AdminUserStatusEnum>;

/**
 * Customer row returned by `GET /admin/users`.
 * Aligned with OpenAPI components.schemas.AdminUserListItem.
 */
export const adminUserListItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.email(),
  createdAt: z.string(),
  planCount: z.number().int().default(0),
  totalSaved: z.number().int().default(0),
  activePlanCount: z.number().int().default(0),
  status: AdminUserStatusEnum,
});
export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;

/**
 * Query for `GET /admin/users`.
 */
export const adminUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});
export type AdminUsersQueryInput = z.infer<typeof adminUsersQuerySchema>;

export const paginatedAdminUsersSchema = createPaginatedDataSchema(
  adminUserListItemSchema,
);
export type PaginatedAdminUsers = z.infer<typeof paginatedAdminUsersSchema>;

/**
 * Body for super-admin `POST /auth/admin`.
 */
export const createAdminSchema = z.object({
  name: z.string().trim().min(2, "Enter the admin's full name"),
  email: z.string().trim().email("Enter a valid work email"),
  password: z
    .string()
    .min(6, "Temporary password must be at least 6 characters"),
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
