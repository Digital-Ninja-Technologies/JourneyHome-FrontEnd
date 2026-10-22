import { api } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

export async function fetchAdmins(): Promise<AdminUser[]> {
  return api<AdminUser[]>("/auth/admins");
}

export async function addAdmin(
  body: Record<string, string>,
): Promise<AdminUser> {
  return api<AdminUser>("/auth/admin", { method: "POST", body });
}

export async function removeAdmin(
  id: string,
): Promise<{ removed: boolean }> {
  return api<{ removed: boolean }>(`/auth/admin/${id}`, {
    method: "DELETE",
  });
}
