import {
  type DashboardSummary,
  dashboardSummarySchema,
  type Plan,
  planSchema,
  plansListResponseSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export async function fetchPlans(): Promise<Plan[]> {
  const res = await api<unknown>("/plans");
  return parseApiResponse(
    plansListResponseSchema,
    res,
    "Invalid plans response from server",
  );
}

export async function fetchPlan(id: string): Promise<Plan> {
  const res = await api<unknown>(`/plans/${id}`);
  return parseApiResponse(
    planSchema,
    res,
    `Invalid plan (${id}) response from server`,
  );
}

export async function createPlan(data: unknown): Promise<Plan> {
  const res = await api<unknown>("/plans", { body: data });
  return parseApiResponse(
    planSchema,
    res,
    "Invalid created plan response from server",
  );
}

export async function fetchPlansDashboardSummary(): Promise<DashboardSummary> {
  const res = await api<unknown>("/plans/dashboard");
  return parseApiResponse(
    dashboardSummarySchema,
    res,
    "Invalid plans dashboard summary response from server",
  );
}
