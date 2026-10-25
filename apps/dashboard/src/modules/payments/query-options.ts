import { queryOptions } from "@tanstack/react-query";
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
