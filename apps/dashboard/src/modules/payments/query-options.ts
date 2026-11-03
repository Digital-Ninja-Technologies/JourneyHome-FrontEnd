import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchPayments, fetchSavedCards } from "./api";

export const paymentsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["payments", userId] as const,
    queryFn: () => fetchPayments(),
    staleTime: 30_000,
  });

export const savedCardsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["cards", userId] as const,
    queryFn: () => fetchSavedCards(),
    retry: false,
  });

export function usePayments() {
  const user = useSessionUser();
  return useQuery(paymentsQueryOptions(user?.id));
}

export function useSavedCards() {
  const user = useSessionUser();
  return useQuery(savedCardsQueryOptions(user?.id));
}
