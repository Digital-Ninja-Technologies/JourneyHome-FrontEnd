import { queryOptions } from "@tanstack/react-query";
import { fetchNotifications } from "./api";

export const notificationsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["notifications", userId] as const,
    queryFn: () => fetchNotifications(),
    staleTime: 30_000,
  });
