import {
  type AdminOverview,
  type AdminOverviewQueryInput,
  adminOverviewSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export async function fetchOverview(
  params?: AdminOverviewQueryInput,
): Promise<AdminOverview> {
  const res = await api<unknown>(`/admin/overview${toQueryString(params)}`);
  return parseApiResponse(
    adminOverviewSchema,
    res,
    "Invalid overview response from server",
  );
}
