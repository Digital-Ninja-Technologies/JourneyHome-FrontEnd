import {
  type AppNotification,
  notificationsListResponseSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await api<unknown>("/notifications");
  return parseApiResponse(
    notificationsListResponseSchema,
    res,
    "Invalid notifications response from server",
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  await api(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function deleteNotification(id: string): Promise<void> {
  await api(`/notifications/${id}`, { method: "DELETE" });
}
