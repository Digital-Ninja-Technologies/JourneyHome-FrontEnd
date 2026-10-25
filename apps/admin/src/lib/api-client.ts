import { createApiClient } from "@journeyhome/api-client";
import { env } from "#/env/client";
import { queryClient } from "@/router";

const STORAGE_KEY = "jh_admin_session";

export function getStoredAdminToken(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.token) return session.token;
    }
    return null;
  } catch {
    return null;
  }
}

export const apiClient = createApiClient({
  baseUrl: env.VITE_API_BASE_URL,
  getAuthToken: getStoredAdminToken,
  onUnauthorized: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      queryClient.setQueryData(["auth", "admin-session"], null);
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`;
      }
    } catch {
      // ignore
    }
  },
});
