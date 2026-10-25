import { queryOptions } from "@tanstack/react-query";
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
    queryFn: () => (id ? fetchPlan(id) : Promise.reject(new Error("No plan ID"))),
    enabled: Boolean(id),
  });
