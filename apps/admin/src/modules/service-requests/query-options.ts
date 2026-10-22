import { queryOptions } from "@tanstack/react-query";
import { fetchAllRequests, fetchRequest } from "./api";

export const allRequestsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["requests", userId] as const,
    queryFn: () => fetchAllRequests(),
    staleTime: 30_000,
  });

export const requestQueryOptions = (id?: string, userId?: string) =>
  queryOptions({
    queryKey: ["request", userId, id] as const,
    queryFn: () =>
      id ? fetchRequest(id) : Promise.reject(new Error("No request ID")),
    enabled: Boolean(id),
  });
