import { z } from "zod";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";

/**
 * In-app notification record schema.
 * Aligned with OpenAPI components.schemas.Notification.
 */
export const appNotificationSchema = z.object({
  _id: z.string(),
  userId: z.string().optional(),
  title: z.string(),
  message: z.string(),
  event: z.string().optional(),
  dedupeKey: z.string().optional(),
  channel: z.string().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string(),
  __v: z.number().optional(),
});
export type AppNotification = z.infer<typeof appNotificationSchema>;

/**
 * Counts object returned in notification list responses.
 */
export const notificationCountsSchema = z.object({
  totalNotifications: z.number().int().default(0),
  totalUnreadNotifications: z.number().int().default(0),
});
export type NotificationCounts = z.infer<typeof notificationCountsSchema>;

/**
 * Paginated notifications response data shape.
 * Aligned with OpenAPI components.schemas.NotificationListResponse data shape.
 */
export const paginatedNotificationsSchema = createPaginatedDataSchema(
  appNotificationSchema,
).extend({
  counts: notificationCountsSchema,
});
export type PaginatedNotifications = z.infer<
  typeof paginatedNotificationsSchema
>;

/**
 * Query schema for `GET /notifications`.
 */
export const notificationQuerySchema = paginationQuerySchema.extend({
  title: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

// Re-export preference schemas from user module for convenience
export {
  type AdminMe,
  adminMeSchema,
  type CustomerPreferences,
  customerPreferencesSchema,
  type NotificationPreferences,
  notificationPreferencesSchema,
} from "./user";
