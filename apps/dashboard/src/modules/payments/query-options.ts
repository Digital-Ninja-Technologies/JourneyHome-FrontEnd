import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import {
  type FetchPaymentsParams,
  type FetchSubscriptionsParams,
  fetchPayment,
  fetchPayments,
  fetchSubscription,
  fetchSubscriptions,
} from "./api";

export const paymentsQueryOptions = (
  params?: FetchPaymentsParams,
  userId?: string,
) =>
  queryOptions({
    queryKey: ["payments", userId, params] as const,
    queryFn: () => fetchPayments(params),
    staleTime: 30_000,
  });

export const paymentDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["payment", id] as const,
    queryFn: () => fetchPayment(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export const subscriptionsQueryOptions = (
  params?: FetchSubscriptionsParams,
  userId?: string,
) =>
  queryOptions({
    queryKey: ["subscriptions", userId, params] as const,
    queryFn: () => fetchSubscriptions(params),
    staleTime: 30_000,
  });

export const subscriptionDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["subscription", id] as const,
    queryFn: () => fetchSubscription(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export function usePayments(params?: FetchPaymentsParams) {
  const user = useSessionUser();
  return useQuery(paymentsQueryOptions(params, user?.id));
}

export function usePayment(id: string) {
  return useQuery(paymentDetailQueryOptions(id));
}

export function useSubscriptions(params?: FetchSubscriptionsParams) {
  const user = useSessionUser();
  return useQuery(subscriptionsQueryOptions(params, user?.id));
}

export function useSubscription(id: string) {
  return useQuery(subscriptionDetailQueryOptions(id));
}
