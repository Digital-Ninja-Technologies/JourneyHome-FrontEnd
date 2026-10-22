import { api } from "@/lib/api";
import type { Plan } from "@/lib/types";

export async function fetchPlans(): Promise<Plan[]> {
  return api<Plan[]>("/plans");
}

export async function fetchPlan(id: string): Promise<Plan> {
  return api<Plan>(`/plans/${id}`);
}

export async function createPlan(data: unknown): Promise<Plan> {
  return api<Plan>("/plans", { body: data });
}
