import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchMe, fetchSession } from "./api";

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: ["auth", "session"] as const,
    queryFn: () => fetchSession(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSession() {
  return useQuery(sessionQueryOptions());
}

export function useAdminUser() {
  const { data } = useSession();
  return data?.user ?? null;
}

export function useIsSuperAdmin() {
  return Boolean(useAdminUser()?.isSuperAdmin);
}

export const meQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "me"] as const,
    queryFn: () => fetchMe(),
    staleTime: 30_000,
  });

export function useMe() {
  return useQuery(meQueryOptions());
}
