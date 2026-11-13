import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import {
  type FetchAdminNotificationsParams,
  fetchAdminNotifications,
} from "./api";

export const adminNotificationsQueryOptions = (
  params?: FetchAdminNotificationsParams,
) =>
  queryOptions({
    queryKey: ["notifications", "list", params] as const,
    queryFn: () => fetchAdminNotifications(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export function useAdminNotifications(params?: FetchAdminNotificationsParams) {
  return useQuery(adminNotificationsQueryOptions(params));
}

/** Overall unread count for the sidebar badge; polls so new events surface. */
export function useUnreadNotificationCount(): number {
  const q = useQuery({
    ...adminNotificationsQueryOptions({ page: 1, limit: 1 }),
    refetchInterval: 60_000,
  });
  return q.data?.counts.totalUnreadNotifications ?? 0;
}
