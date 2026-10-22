import { ApiError } from "@journeyhome/api-client";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export interface MakeQueryClientOptions {
  onUnauthorized?: () => void;
}

export function makeQueryClient(options: MakeQueryClientOptions = {}) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          options.onUnauthorized?.();
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) {
          options.onUnauthorized?.();
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            typeof error.status === "number" &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
