import {
  type AppNotification,
  type NotificationQueryInput,
  paginatedNotificationsSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

/** `?a=1&b=2` from the set filters (`page`, `limit`, `title`, `isRead`, `from`, `to`). */
function toQuery(params?: Partial<NotificationQueryInput>): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchNotifications(
  params?: Partial<NotificationQueryInput>,
): Promise<AppNotification[]> {
  const res = await api<unknown>(`/notifications${toQuery(params)}`);
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
