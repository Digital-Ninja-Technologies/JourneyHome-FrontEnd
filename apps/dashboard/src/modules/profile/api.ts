import { api } from "@/lib/api";
import type { Me } from "./types";

export async function fetchMe(): Promise<Me> {
  return api<Me>("/auth/me");
}

export async function updateMe(body: Record<string, string>): Promise<Me> {
  return api<Me>("/auth/me", { method: "PATCH", body });
}

export async function changePassword(body: {
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ changed?: boolean; success?: boolean }> {
  return api<{ changed?: boolean; success?: boolean }>(
    "/auth/change-password",
    {
      method: "PATCH",
      body,
    },
  );
}

export async function updatePreferences(
  body: Partial<Me["preferences"]>,
): Promise<Me["preferences"]> {
  return api<Me["preferences"]>("/auth/notification-preferences", {
    method: "PATCH",
    body,
  });
}

export async function closeAccount(
  password: string,
): Promise<{ closed?: boolean; success?: boolean }> {
  return api<{ closed?: boolean; success?: boolean }>("/auth/me", {
    method: "DELETE",
    body: { password },
  });
}
