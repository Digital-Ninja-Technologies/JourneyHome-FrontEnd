import {
  type AppNotification,
  type NotificationQueryInput,
  paginatedNotificationsSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export async function fetchNotifications(
  params?: NotificationQueryInput,
): Promise<AppNotification[]> {
  const query = new URLSearchParams();
  if (params) {
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.isRead !== undefined) query.set("isRead", String(params.isRead));
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await api<unknown>(`/notifications${qs}`);
  const parsed = parseApiResponse(
    paginatedNotificationsSchema,
    res,
    "Invalid notifications response from server",
  );
  return parsed.items;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api(`/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await api(`/notifications/${encodeURIComponent(id)}`, { method: "DELETE" });
}
