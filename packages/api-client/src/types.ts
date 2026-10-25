import type { ApiError } from "./api-error";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export interface CreateApiClientOptions {
  baseUrl: string;
  getAuthToken?: () => string | null;
  onUnauthorized?: (error: ApiError) => void;
}

export type ApiClientFn = <T>(
  endpoint: string,
  options?: RequestInit,
) => Promise<T>;
