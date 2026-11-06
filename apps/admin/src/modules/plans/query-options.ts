import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { type FetchPlansParams, fetchPlan, fetchPlans } from "./api";

export const plansQueryOptions = (params?: FetchPlansParams) =>
  queryOptions({
    queryKey: ["plans", "list", params] as const,
    queryFn: () => fetchPlans(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const planQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["plans", "detail", id] as const,
    queryFn: () => fetchPlan(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export function usePlans(params?: FetchPlansParams) {
  return useQuery(plansQueryOptions(params));
}

export function usePlan(id: string) {
  return useQuery(planQueryOptions(id));
}

/**
 * Detail endpoints return `owner` as an id. The admin plans list populates it,
 * so one filtered row is enough to show the owner's name and email.
 */
export function useOwnerSummary(ownerId: string | undefined) {
  return useQuery({
    ...plansQueryOptions({ ownerId, limit: 1 }),
    enabled: Boolean(ownerId),
    placeholderData: undefined,
    select: (page) => page.items[0]?.owner ?? null,
  });
}
