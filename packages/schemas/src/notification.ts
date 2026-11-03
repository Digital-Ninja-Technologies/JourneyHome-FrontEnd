import { z } from "zod";

export const appNotificationSchema = z.object({
  _id: z.string(),
  title: z.string(),
  message: z.string(),
  event: z.string(),
  isRead: z.boolean().default(false),
  plan: z.string().optional(),
  subject: z.string().optional(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof appNotificationSchema>;

export const paginatedNotificationsSchema = z.object({
  items: z.array(appNotificationSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
  counts: z.object({
    totalNotifications: z.number(),
    totalUnreadNotifications: z.number(),
  }),
});
export type PaginatedNotifications = z.infer<typeof paginatedNotificationsSchema>;

export const customerPreferencesSchema = z.object({
  paymentReminders: z.boolean(),
  deficitAlerts: z.boolean(),
  serviceRequestUpdates: z.boolean(),
  productNewsOffers: z.boolean(),
});
export type CustomerPreferences = z.infer<typeof customerPreferencesSchema>;

export const adminPreferencesSchema = z.object({
  newServiceRequest: z.boolean(),
  paymentFailed: z.boolean(),
  weeklyDigest: z.boolean(),
});
export type AdminPreferences = z.infer<typeof adminPreferencesSchema>;
