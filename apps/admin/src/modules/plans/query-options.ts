import { queryOptions } from "@tanstack/react-query";
import { fetchAllPlans, fetchPlan } from "./api";

export const allPlansQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["plans", userId] as const,
    queryFn: () => fetchAllPlans(),
    staleTime: 30_000,
  });

export const planQueryOptions = (id?: string, userId?: string) =>
  queryOptions({
    queryKey: ["plan", userId, id] as const,
    queryFn: () => (id ? fetchPlan(id) : Promise.reject(new Error("No plan ID"))),
    enabled: Boolean(id),
  });
