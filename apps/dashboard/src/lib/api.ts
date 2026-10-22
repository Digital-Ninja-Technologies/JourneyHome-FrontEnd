import { mockRequest, NOT_MOCKED } from "../mocks";
import { ApiError } from "./errors";

export { ApiError, isUnsupported, UNSUPPORTED_MESSAGE } from "./errors";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3043/api/v1";

/**
 * Demo mode simulates the endpoints the backend doesn't have yet (verification codes, password reset,
 * profile, saved cards). On by default in dev; set VITE_USE_MOCKS=true/false to override.
 */
export const USE_MOCKS: boolean = import.meta.env.VITE_USE_MOCKS
  ? import.meta.env.VITE_USE_MOCKS === "true"
  : import.meta.env.DEV;

let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApi(opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const method = init.method ?? (init.body ? "POST" : "GET");
  if (USE_MOCKS) {
    const mocked = await mockRequest(method, path, init.body);
    if (mocked !== NOT_MOCKED) return mocked as T;
  }
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Can't reach the server. Check your connection and try again.",
    );
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(
      res.status,
      json?.message ?? "Something went wrong. Please try again.",
    );
  }
  return json.data as T;
}
