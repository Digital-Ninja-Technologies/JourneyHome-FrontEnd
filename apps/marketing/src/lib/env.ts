/**
 * Typed environment variables for TanStack Start.
 * Reads VITE_* env vars via import.meta.env with fallback to legacy NEXT_PUBLIC_* env vars.
 */
function getEnv(viteKey: string, nextKey: string, defaultValue: string): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const val = (import.meta.env as Record<string, string | undefined>)[viteKey] ||
                (import.meta.env as Record<string, string | undefined>)[nextKey];
    if (typeof val === "string" && val.length > 0) return val;
  }
  if (typeof process !== "undefined" && process.env) {
    const val = process.env[viteKey] || process.env[nextKey];
    if (typeof val === "string" && val.length > 0) return val;
  }
  return defaultValue;
}

export const env = {
  API_URL: getEnv("VITE_API_URL", "NEXT_PUBLIC_API_URL", "http://localhost:3043/api/v1"),
  APP_URL: getEnv("VITE_APP_URL", "NEXT_PUBLIC_APP_URL", "http://localhost:5173"),
  SITE_ORIGIN: getEnv("VITE_SITE_ORIGIN", "NEXT_PUBLIC_SITE_ORIGIN", "https://journeyhome.ng"),
} as const;
