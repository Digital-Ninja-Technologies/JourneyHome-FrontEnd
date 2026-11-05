import type { NotificationQueryInput } from "@journeyhome/schemas";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchNotifications } from "./api";

export const notificationsQueryOptions = (
  params?: NotificationQueryInput,
  userId?: string,
) =>
  queryOptions({
    queryKey: ["notifications", userId, params] as const,
    queryFn: () => fetchNotifications(params),
    staleTime: 30_000,
  });

export function useNotifications(params?: NotificationQueryInput) {
  const user = useSessionUser();
  return useQuery(notificationsQueryOptions(params, user?.id));
}
