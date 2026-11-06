import { createApiClient } from "@journeyhome/api-client";
import { env } from "@/env/client";
import { queryClient } from "@/lib/query";

export const SESSION_KEY = "jh_admin_session";

export function getStoredToken(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.token ?? null;
  } catch {
    return null;
  }
}

export const apiClient = createApiClient({
  baseUrl: env.VITE_API_BASE_URL,
  getAuthToken: getStoredToken,
  onUnauthorized: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      queryClient.clear();
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
