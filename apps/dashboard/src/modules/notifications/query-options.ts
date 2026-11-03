import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchNotifications } from "./api";

export const notificationsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["notifications", userId] as const,
    queryFn: () => fetchNotifications(),
    staleTime: 30_000,
  });

export function useNotifications() {
  const user = useSessionUser();
  return useQuery(notificationsQueryOptions(user?.id));
}
