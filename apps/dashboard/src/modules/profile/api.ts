import {
  customerMeSchema,
  customerPreferencesSchema,
  type NotificationPreferences,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";
import type { Me } from "./types";

export async function fetchMe(): Promise<Me> {
  const res = await api<unknown>("/auth/me");
  return parseApiResponse(
    customerMeSchema,
    res,
    "Invalid customer profile response",
  );
}

export async function updateMe(
  body: Partial<Pick<Me, "name" | "email">> | Record<string, unknown>,
): Promise<Me> {
  const res = await api<unknown>("/auth/me", { method: "PATCH", body });
  return parseApiResponse(
    customerMeSchema,
    res,
    "Invalid updated profile response",
  );
}

export const updateCustomerProfile = updateMe;
export const fetchCustomerProfile = fetchMe;

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
  body: NotificationPreferences,
): Promise<NotificationPreferences> {
  const res = await api<unknown>("/auth/notification-preferences", {
    method: "PATCH",
    body,
  });
  return parseApiResponse(
    customerPreferencesSchema,
    res,
    "Invalid notification preferences response",
  );
}

export async function closeAccount(
  password: string,
): Promise<{ closed?: boolean; success?: boolean }> {
  return api<{ closed?: boolean; success?: boolean }>("/auth/me", {
    method: "DELETE",
    body: { password },
  });
}
