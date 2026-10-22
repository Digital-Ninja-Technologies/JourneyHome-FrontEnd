import { queryOptions } from "@tanstack/react-query";
import { fetchServiceRequest, fetchServiceRequests } from "./api";

export const serviceRequestsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["service-requests", userId] as const,
    queryFn: () => fetchServiceRequests(),
    staleTime: 30_000,
  });

export const serviceRequestQueryOptions = (id?: string, userId?: string) =>
  queryOptions({
    queryKey: ["service-request", userId, id] as const,
    queryFn: () =>
      id
        ? fetchServiceRequest(id)
        : Promise.reject(new Error("No service request ID")),
    enabled: Boolean(id),
  });
