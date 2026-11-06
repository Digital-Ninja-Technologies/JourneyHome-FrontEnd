import { ApiError } from "@journeyhome/api-client";
import { env } from "@/env/client";
import { apiClient } from "./client";
import { mockRequest, NOT_MOCKED } from "./mocks";

export { ApiError } from "@journeyhome/api-client";
export { ApiValidationError, parseApiResponse } from "@journeyhome/schemas";

/** The server doesn't have this endpoint (yet). */
export const isUnsupported = (e: unknown): boolean =>
  e instanceof ApiError &&
  typeof e.status === "number" &&
  [404, 405, 501].includes(e.status);

export const UNSUPPORTED_MESSAGE = "The server doesn't provide this yet.";

export const USE_MOCKS: boolean = env.VITE_USE_MOCKS;

export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const method = init.method ?? (init.body ? "POST" : "GET");
  if (USE_MOCKS) {
    const mocked = await mockRequest(method, path, init.body);
    if (mocked !== NOT_MOCKED) return mocked as T;
  }

  const res = await apiClient<
    { success?: boolean; data?: T; message?: string } | T
  >(path, {
    method,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (
    res &&
    typeof res === "object" &&
    "data" in res &&
    (res as { data?: T }).data !== undefined
  ) {
    return (res as { data: T }).data;
  }
  return res as T;
}

/** `?a=1&b=2` from an object, skipping empty values. Returns "" when nothing is set. */
export function toQueryString(params?: object): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}
