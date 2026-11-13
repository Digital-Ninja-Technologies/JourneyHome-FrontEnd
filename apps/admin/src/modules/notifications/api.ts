import {
  type AppNotification,
  appNotificationSchema,
  type NotificationQueryInput,
  type PaginatedNotifications,
  paginatedNotificationsSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchAdminNotificationsParams = Partial<NotificationQueryInput>;

/** The signed-in admin's operational notifications, newest first. */
export async function fetchAdminNotifications(
  params?: FetchAdminNotificationsParams,
): Promise<PaginatedNotifications> {
  const res = await api<unknown>(
    `/notifications/admin${toQueryString(params)}`,
  );
  return parseApiResponse(
    paginatedNotificationsSchema,
    res,
    "Invalid notifications response from server",
  );
}

export async function markNotificationRead(
  id: string,
): Promise<AppNotification> {
  const res = await api<unknown>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
  return parseApiResponse(
    appNotificationSchema,
    res,
    "Invalid notification response from server",
  );
}

export async function deleteNotification(id: string): Promise<void> {
  await api(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
}
