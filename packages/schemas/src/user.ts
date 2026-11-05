import { z } from "zod";
import { UserRoleEnum } from "./enums";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";

/**
 * Notification preferences schema aligned with OpenAPI components.schemas.NotificationPreferences.
 */
export const notificationPreferencesSchema = z.object({
  paymentReminders: z.boolean().default(true),
  deficitAlerts: z.boolean().default(true),
  serviceRequestUpdates: z.boolean().default(true),
  productNewsOffers: z.boolean().default(false),
});
export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;

/**
 * Alias for notificationPreferencesSchema for backwards compatibility.
 */
export const customerPreferencesSchema = notificationPreferencesSchema;
export type CustomerPreferences = NotificationPreferences;

/**
 * User profile returned by `GET /auth/me`.
 * Aligned with OpenAPI components.schemas.UserProfile.
 */
export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleEnum,
  isSuperAdmin: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  notificationPreferences: notificationPreferencesSchema,
});
export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Alias for userProfileSchema.
 */
export const customerMeSchema = userProfileSchema;
export type CustomerMe = UserProfile;

/**
 * Populated owner summary reference in admin views.
 * Aligned with OpenAPI components.schemas.UserSummary.
 */
export const userSummarySchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type UserSummary = z.infer<typeof userSummarySchema>;

/**
 * Customer item returned by admin `GET /auth/customers`.
 * Uses `_id` per OpenAPI components.schemas.CustomerListItem.
 */
export const customerListItemSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleEnum,
  isSuperAdmin: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  notificationPreferences: notificationPreferencesSchema.optional(),
  plansCount: z.number().optional(),
});
export type CustomerListItem = z.infer<typeof customerListItemSchema>;
export const customerSchema = customerListItemSchema;
export type Customer = CustomerListItem;

/**
 * Query schema for admin `GET /auth/customers`.
 */
export const customerListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  emailVerified: z.coerce.boolean().optional(),
});
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

/**
 * Paginated customers result schema.
 */
export const paginatedCustomersSchema = createPaginatedDataSchema(
  customerListItemSchema,
);
export type PaginatedCustomers = z.infer<typeof paginatedCustomersSchema>;

/**
 * Admin user record aligned with OpenAPI components.schemas.AdminUser.
 */
export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleEnum,
  isSuperAdmin: z.boolean(),
  createdAt: z.string().optional(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminMeSchema = adminUserSchema.extend({
  preferences: z
    .object({
      newServiceRequest: z.boolean().default(true),
      paymentFailed: z.boolean().default(true),
      weeklyDigest: z.boolean().default(false),
    })
    .optional(),
});
export type AdminMe = z.infer<typeof adminMeSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  })
  .refine((c) => c.currentPassword !== c.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
