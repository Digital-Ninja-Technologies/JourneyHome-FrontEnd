import {
  type DashboardSummary,
  dashboardSummarySchema,
  type Plan,
  type PlanQueryInput,
  paginatedPlansSchema,
  planSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export async function fetchPlans(params?: PlanQueryInput): Promise<Plan[]> {
  const query = new URLSearchParams();
  if (params) {
    if (params.name) query.set("name", params.name);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await api<unknown>(`/plans${qs}`);
  const parsed = parseApiResponse(
    paginatedPlansSchema,
    res,
    "Invalid plans response from server",
  );
  return parsed.items;
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
