import { api } from "@/lib/api";
import type { Plan, PlanStatus } from "@/lib/types";

export async function fetchAllPlans(): Promise<Plan[]> {
  return api<Plan[]>("/plans/admin");
}

export async function fetchPlan(id: string): Promise<Plan> {
  return api<Plan>(`/plans/${id}`);
}

export async function updatePlanStatus(
  id: string,
  status: PlanStatus,
): Promise<Plan> {
  return api<Plan>(`/plans/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}
