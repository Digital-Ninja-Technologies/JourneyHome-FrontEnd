import { api } from "@/lib/api";
import type { AppNotification } from "@journeyhome/schemas";

export async function fetchNotifications(): Promise<AppNotification[]> {
  return api<AppNotification[]>("/notifications");
}
