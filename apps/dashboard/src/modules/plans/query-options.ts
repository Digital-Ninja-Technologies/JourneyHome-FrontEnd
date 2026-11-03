import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchPlan, fetchPlans, fetchPlansDashboardSummary } from "./api";

export const plansQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["plans", userId] as const,
    queryFn: () => fetchPlans(),
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

export function usePlans() {
  const user = useSessionUser();
  return useQuery(plansQueryOptions(user?.id));
}

export function usePlan(id: string | undefined) {
  const user = useSessionUser();
  return useQuery(planQueryOptions(id, user?.id));
}

export function usePlansDashboardSummary() {
  const user = useSessionUser();
  return useQuery(plansDashboardSummaryQueryOptions(user?.id));
}
