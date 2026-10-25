import { api } from "@/lib/api";
import type { Me } from "@/lib/queries";

export async function fetchMe(): Promise<Me> {
  return api<Me>("/auth/me");
}

export async function updateMe(body: Record<string, string>): Promise<Me> {
  return api<Me>("/auth/me", { method: "PATCH", body });
}

export async function changePassword(body: {
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ changed: boolean }> {
  return api<{ changed: boolean }>("/auth/me/password", {
    method: "PATCH",
    body,
  });
}

export async function updatePreferences(
  body: Partial<Me["preferences"]>,
): Promise<Me["preferences"]> {
  return api<Me["preferences"]>("/auth/me/preferences", {
    method: "PATCH",
    body,
  });
}

export async function closeAccount(): Promise<{ closed: boolean }> {
  return api<{ closed: boolean }>("/auth/me", { method: "DELETE" });
}
