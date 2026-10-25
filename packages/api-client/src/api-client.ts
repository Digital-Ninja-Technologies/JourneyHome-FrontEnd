import { ApiError } from "./api-error";
import type { ApiClientFn, CreateApiClientOptions } from "./types";

export function createApiClient(options: CreateApiClientOptions): ApiClientFn {
  const normalizedBase = options.baseUrl.replace(/\/+$/, "");

  return async function apiClient<T>(
    endpoint: string,
    requestOptions: RequestInit = {},
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${normalizedBase}${cleanEndpoint}`;

    const signal =
      requestOptions.signal ||
      (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(60000)
        : undefined);

    const isFormData =
      typeof FormData !== "undefined" && requestOptions.body instanceof FormData;

    const headers = new Headers(requestOptions.headers);

    if (!isFormData && !headers.has("Content-Type") && requestOptions.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Authorization") && options.getAuthToken) {
      const token = options.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...requestOptions,
        signal,
        headers,
      });
    } catch (error) {
      throw new ApiError(
        error instanceof Error ? error.message : "Network request failed",
      );
    }

    if (!response.ok) {
      let errorData: unknown;
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
          if (
            errorData &&
            typeof errorData === "object" &&
            "message" in errorData &&
            typeof (errorData as { message: unknown }).message === "string"
          ) {
            errorMessage = (errorData as { message: string }).message;
          }
        } catch {
          errorData = text;
          if (text.trim()) {
            errorMessage = text.trim();
          }
        }
      } catch {
        // Body reading failed
      }

      const apiError = new ApiError(errorMessage, response.status, errorData);

      if (response.status === 401 && options.onUnauthorized) {
        try {
          options.onUnauthorized(apiError);
        } catch {
          // Prevent onUnauthorized failure from masking the ApiError
        }
      }

      throw apiError;
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const text = await response.text();
    if (!text.trim()) {
      return undefined as unknown as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  };
}
