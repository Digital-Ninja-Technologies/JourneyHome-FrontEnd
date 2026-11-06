import {
  type AdminPlanQueryInput,
  type PaginatedAdminPlans,
  type Plan,
  type PlanStatus,
  paginatedAdminPlansSchema,
  planSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchPlansParams = Partial<AdminPlanQueryInput>;

export async function fetchPlans(
  params?: FetchPlansParams,
): Promise<PaginatedAdminPlans> {
  const res = await api<unknown>(`/plans/admin${toQueryString(params)}`);
  return parseApiResponse(
    paginatedAdminPlansSchema,
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

export async function updatePlanStatus(
  id: string,
  status: PlanStatus,
): Promise<Plan> {
  const res = await api<unknown>(`/plans/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return parseApiResponse(
    planSchema,
    res,
    "Invalid plan status response from server",
  );
}
