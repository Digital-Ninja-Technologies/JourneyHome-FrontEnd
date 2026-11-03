import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
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

export function useServiceRequests() {
  const user = useSessionUser();
  return useQuery(serviceRequestsQueryOptions(user?.id));
}

export function useServiceRequest(id: string) {
  const user = useSessionUser();
  return useQuery(serviceRequestQueryOptions(id, user?.id));
}
