import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { type FetchPaymentsParams, fetchPayments } from "./api";

export const paymentsQueryOptions = (params?: FetchPaymentsParams) =>
  queryOptions({
    queryKey: ["payments", "list", params] as const,
    queryFn: () => fetchPayments(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export function usePayments(params?: FetchPaymentsParams) {
  return useQuery(paymentsQueryOptions(params));
}
