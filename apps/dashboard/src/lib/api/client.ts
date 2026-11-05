import { createApiClient } from "@journeyhome/api-client";
import { env } from "@/env/client";
import { queryClient } from "@/lib/query";

const STORAGE_KEY = "jh_session";

export function getStoredToken(): string | null {
  try {
    for (const store of [sessionStorage, localStorage]) {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.token) return session.token;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export const apiClient = createApiClient({
  baseUrl: env.VITE_API_BASE_URL,
  getAuthToken: getStoredToken,
  onUnauthorized: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("jh_selected_package");
      localStorage.removeItem("jh_selected_package");
      sessionStorage.removeItem("jh_pending_verification_email");
      sessionStorage.removeItem("jh_onboarding_plan");
      queryClient.clear();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup") &&
        !window.location.pathname.startsWith("/verify-email")
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
