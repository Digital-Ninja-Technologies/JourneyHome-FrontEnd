import { QueryClient } from "@tanstack/react-query";

type ErrorLike = {
  status?: number;
  statusCode?: number;
  message?: unknown;
  data?: { status?: number };
};

const NON_RETRYABLE_STATUSES = new Set([401, 403, 404]);
const NON_RETRYABLE_MESSAGES = ["unauthorized", "forbidden", "not found"];

function shouldRetry(failureCount: number, error: unknown) {
  const e = (error ?? {}) as ErrorLike;
  const status = e.status ?? e.statusCode ?? e.data?.status;
  const message = typeof e.message === "string" ? e.message.toLowerCase() : "";
  if (
    (status !== undefined && NON_RETRYABLE_STATUSES.has(status)) ||
    NON_RETRYABLE_MESSAGES.some((m) => message.includes(m))
  ) {
    return false;
  }
  return failureCount < 2;
}

/** Creates a fresh client; call once per request on the server and once in the browser. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  });
}
