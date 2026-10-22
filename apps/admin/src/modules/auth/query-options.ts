import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAdminSession } from "./api";

export const adminSessionQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "admin-session"] as const,
    queryFn: () => fetchAdminSession(),
    staleTime: Infinity,
  });

export function useAdminSession() {
  return useQuery(adminSessionQueryOptions());
}

export function useAdminUser() {
  const { data } = useAdminSession();
  return data?.user ?? null;
}

export function useIsSuperAdmin() {
  const user = useAdminUser();
  return Boolean(user && (user.isSuperAdmin || user.role === "super_admin"));
}
