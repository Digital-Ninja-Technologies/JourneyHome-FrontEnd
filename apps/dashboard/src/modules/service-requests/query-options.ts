import type { ServiceRequestQueryInput } from "@journeyhome/schemas";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchServiceRequest, fetchServiceRequests } from "./api";

export const serviceRequestsQueryOptions = (
  params?: ServiceRequestQueryInput,
  userId?: string,
) =>
  queryOptions({
    queryKey: ["service-requests", userId, params] as const,
    queryFn: () => fetchServiceRequests(params),
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

export function useServiceRequests(params?: ServiceRequestQueryInput) {
  const user = useSessionUser();
  return useQuery(serviceRequestsQueryOptions(params, user?.id));
}

export function useServiceRequest(id: string) {
  const user = useSessionUser();
  return useQuery(serviceRequestQueryOptions(id, user?.id));
}
