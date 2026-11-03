import type { AppNotification } from "@journeyhome/schemas";
import { api } from "@/lib/api";

export async function fetchNotifications(): Promise<AppNotification[]> {
  return api<AppNotification[]>("/notifications");
}
