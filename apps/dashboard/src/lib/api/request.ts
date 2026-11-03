import { env } from "@/env/client";
import { ApiError } from "@journeyhome/api-client";
import { apiClient } from "./client";
import { mockRequest, NOT_MOCKED } from "./mocks";

export { ApiError } from "@journeyhome/api-client";

export const isUnsupported = (e: unknown): boolean =>
  e instanceof ApiError &&
  typeof e.status === "number" &&
  [404, 405, 501].includes(e.status);

export const UNSUPPORTED_MESSAGE = "This isn't available on the server yet.";

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
    (res as any).data !== undefined
  ) {
    return (res as any).data as T;
  }
  return res as T;
}
