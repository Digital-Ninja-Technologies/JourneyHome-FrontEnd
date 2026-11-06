import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import {
  type FetchServiceRequestsParams,
  fetchServiceRequest,
  fetchServiceRequests,
} from "./api";

export const serviceRequestsQueryOptions = (
  params?: FetchServiceRequestsParams,
) =>
  queryOptions({
    queryKey: ["service-requests", "list", params] as const,
    queryFn: () => fetchServiceRequests(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const serviceRequestQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["service-requests", "detail", id] as const,
    queryFn: () => fetchServiceRequest(id),
    enabled: Boolean(id),
    staleTime: 15_000,
  });

export function useServiceRequests(params?: FetchServiceRequestsParams) {
  return useQuery(serviceRequestsQueryOptions(params));
}

export function useServiceRequest(id: string) {
  return useQuery(serviceRequestQueryOptions(id));
}
