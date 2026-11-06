import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import {
  type FetchContactMessagesParams,
  fetchContactMessage,
  fetchContactMessages,
} from "./api";

export const contactMessagesQueryOptions = (
  params?: FetchContactMessagesParams,
) =>
  queryOptions({
    queryKey: ["contact", "list", params] as const,
    queryFn: () => fetchContactMessages(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const contactMessageQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["contact", "detail", id] as const,
    queryFn: () => fetchContactMessage(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

export function useContactMessages(params?: FetchContactMessagesParams) {
  return useQuery(contactMessagesQueryOptions(params));
}

export function useContactMessage(id: string | undefined) {
  return useQuery(contactMessageQueryOptions(id ?? ""));
}
