import type { AdminMe } from "@journeyhome/schemas";
import { api } from "@/lib/api";

/**
 * Off-spec: neither endpoint is in api-doc.yaml yet. They work against the
 * mock server; the real API answers 404 and the UI shows "not available yet".
 */
export type AdminPreferences = NonNullable<AdminMe["preferences"]>;

export async function updatePreferences(
  patch: Partial<AdminPreferences>,
): Promise<AdminPreferences> {
  return api<AdminPreferences>("/auth/me/preferences", {
    method: "PATCH",
    body: patch,
  });
}

export async function revokeOtherSessions(): Promise<{ revoked: number }> {
  return api<{ revoked: number }>("/auth/sessions/revoke-others", {
    method: "POST",
  });
}
