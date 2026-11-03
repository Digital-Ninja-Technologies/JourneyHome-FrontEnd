import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth/query-options";
import { fetchPlan, fetchPlans } from "./api";

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

export function usePlans() {
  const user = useSessionUser();
  return useQuery(plansQueryOptions(user?.id));
}

export function usePlan(id: string | undefined) {
  const user = useSessionUser();
  return useQuery(planQueryOptions(id, user?.id));
}
