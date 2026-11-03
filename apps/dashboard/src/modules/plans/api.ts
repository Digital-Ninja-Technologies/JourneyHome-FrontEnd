import type { DashboardSummary, Plan } from "@journeyhome/schemas";
import { api } from "@/lib/api";

export async function fetchPlans(): Promise<Plan[]> {
  const res = await api<Plan[] | { items: Plan[] }>("/plans");
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).items)) return (res as any).items;
  return [];
}

export async function fetchPlan(id: string): Promise<Plan> {
  return api<Plan>(`/plans/${id}`);
}

export async function createPlan(data: unknown): Promise<Plan> {
  return api<Plan>("/plans", { body: data });
}

export async function fetchPlansDashboardSummary(): Promise<DashboardSummary> {
  return api<DashboardSummary>("/plans/dashboard");
}
