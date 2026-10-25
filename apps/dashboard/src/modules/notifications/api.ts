import { api } from "@/lib/api";
import type { AppNotification } from "@/lib/types";

export async function fetchNotifications(): Promise<AppNotification[]> {
  return api<AppNotification[]>("/notifications");
}
