import { z } from "zod";

export const appNotificationSchema = z.object({
  _id: z.string(),
  plan: z.string().optional(),
  event: z.string(),
  subject: z.string().optional(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof appNotificationSchema>;

export const customerPreferencesSchema = z.object({
  paymentReminders: z.boolean(),
  deficitAlerts: z.boolean(),
  serviceUpdates: z.boolean(),
  productNews: z.boolean(),
});
export type CustomerPreferences = z.infer<typeof customerPreferencesSchema>;

export const adminPreferencesSchema = z.object({
  newServiceRequest: z.boolean(),
  paymentFailed: z.boolean(),
  weeklyDigest: z.boolean(),
});
export type AdminPreferences = z.infer<typeof adminPreferencesSchema>;
