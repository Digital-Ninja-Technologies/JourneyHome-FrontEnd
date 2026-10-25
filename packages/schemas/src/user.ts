import { z } from "zod";
import { UserRoleEnum } from "./enums";
import { adminPreferencesSchema, customerPreferencesSchema } from "./notification";

export const customerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
  plansCount: z.number().optional(),
});
export type Customer = z.infer<typeof customerSchema>;

export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleEnum,
  isSuperAdmin: z.boolean(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const customerMeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.string(),
  preferences: customerPreferencesSchema,
});
export type CustomerMe = z.infer<typeof customerMeSchema>;

export const adminMeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleEnum.optional(),
  isSuperAdmin: z.boolean().optional(),
  preferences: adminPreferencesSchema,
});
export type AdminMe = z.infer<typeof adminMeSchema>;

export const auditEntrySchema = z.object({
  _id: z.string(),
  actor: z.string().optional(),
  actorName: z.string().optional(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  resourceLabel: z.string().optional(),
  createdAt: z.string(),
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().trim().email("Please enter a valid email address").optional(),
  phone: z.string().trim().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
