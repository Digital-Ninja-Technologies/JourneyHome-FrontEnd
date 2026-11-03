import type { AppNotification } from "@journeyhome/schemas";
import { api } from "@/lib/api";

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await api<AppNotification[] | { items: AppNotification[] }>(
    "/notifications",
  );
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).items)) return (res as any).items;
  return [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await api(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function deleteNotification(id: string): Promise<void> {
  await api(`/notifications/${id}`, { method: "DELETE" });
}
