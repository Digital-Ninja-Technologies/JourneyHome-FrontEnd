import { useSessionUser } from "@/modules/auth/query-options";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchMe } from "./api";

export const meQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["me", userId] as const,
    queryFn: () => fetchMe(),
    staleTime: 60_000,
    retry: false,
  });

export function useMe() {
  const user = useSessionUser();
  return useQuery(meQueryOptions(user?.id));
}
