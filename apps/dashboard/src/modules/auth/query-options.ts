import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchSession } from "./api";

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "session"] as const,
    queryFn: () => fetchSession(),
    staleTime: 5 * 60 * 1000,
  });

export function useSession() {
  return useQuery(sessionQueryOptions());
}

export function useSessionUser() {
  const { data } = useSession();
  return data?.user ?? null;
}
