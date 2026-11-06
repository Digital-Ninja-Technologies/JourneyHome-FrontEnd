import {
  type AdminUsersQueryInput,
  type PaginatedAdminUsers,
  paginatedAdminUsersSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchUsersParams = Partial<AdminUsersQueryInput>;

/** Customers with server-derived plan counts, savings, and status. */
export async function fetchUsers(
  params?: FetchUsersParams,
): Promise<PaginatedAdminUsers> {
  const res = await api<unknown>(`/admin/users${toQueryString(params)}`);
  return parseApiResponse(
    paginatedAdminUsersSchema,
    res,
    "Invalid users response from server",
  );
}
