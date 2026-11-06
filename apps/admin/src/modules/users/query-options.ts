import type { AdminUserListItem, UserSummary } from "@journeyhome/schemas";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useOwnerSummary } from "@/modules/plans/query-options";
import { useServiceRequests } from "@/modules/service-requests/query-options";
import { type FetchUsersParams, fetchUsers } from "./api";

export const usersQueryOptions = (params?: FetchUsersParams) =>
  queryOptions({
    queryKey: ["users", "list", params] as const,
    queryFn: () => fetchUsers(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export function useUsers(params?: FetchUsersParams) {
  return useQuery(usersQueryOptions(params));
}

/** A users-list row already in the cache (e.g. we came from the list). */
function useCachedUserRow(id: string): AdminUserListItem | undefined {
  const queryClient = useQueryClient();
  for (const [, page] of queryClient.getQueriesData<{
    items: AdminUserListItem[];
  }>({
    queryKey: ["users", "list"],
  })) {
    const row = page?.items.find((u) => u._id === id);
    if (row) return row;
  }
  return undefined;
}

/**
 * The API has no user-by-id endpoint. Identity comes from the populated owner
 * on the user's plans or requests, falling back to a cached users-list row.
 */
export function useUserSummary(id: string): {
  user: (UserSummary & Partial<AdminUserListItem>) | null;
  isPending: boolean;
} {
  const cached = useCachedUserRow(id);
  const fromPlans = useOwnerSummary(id);
  const fromRequests = useServiceRequests({ ownerId: id, limit: 1 });
  const owner = fromPlans.data ?? fromRequests.data?.items[0]?.owner ?? null;

  if (cached) return { user: { ...owner, ...cached }, isPending: false };
  return {
    user: owner,
    isPending: fromPlans.isPending || fromRequests.isPending,
  };
}
