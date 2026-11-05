import type { PlanQueryInput } from "@journeyhome/schemas";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchPlan, fetchPlans, fetchPlansDashboardSummary } from "./api";

export const plansQueryOptions = (params?: PlanQueryInput, userId?: string) =>
  queryOptions({
    queryKey: ["plans", userId, params] as const,
    queryFn: () => fetchPlans(params),
    staleTime: 30_000,
  });

export const planQueryOptions = (id?: string, userId?: string) =>
  queryOptions({
    queryKey: ["plan", userId, id] as const,
    queryFn: () =>
      id ? fetchPlan(id) : Promise.reject(new Error("No plan ID")),
    enabled: Boolean(id),
  });

export const plansDashboardSummaryQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["plans", "dashboard-summary", userId] as const,
    queryFn: () => fetchPlansDashboardSummary(),
    staleTime: 30_000,
  });

export function usePlans(params?: PlanQueryInput) {
  const user = useSessionUser();
  return useQuery(plansQueryOptions(params, user?.id));
}

export function usePlan(id: string | undefined) {
  const user = useSessionUser();
  return useQuery(planQueryOptions(id, user?.id));
}

export function usePlansDashboardSummary() {
  const user = useSessionUser();
  return useQuery(plansDashboardSummaryQueryOptions(user?.id));
}
