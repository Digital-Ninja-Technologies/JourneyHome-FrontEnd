import {
  type AdminPackage,
  type AdminPackageQueryInput,
  adminPackageSchema,
  type CreatePackageInput,
  type PaginatedAdminPackages,
  paginatedAdminPackagesSchema,
  type UpdatePackageInput,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchPackagesParams = Partial<AdminPackageQueryInput>;

export async function fetchPackages(
  params?: FetchPackagesParams,
): Promise<PaginatedAdminPackages> {
  const res = await api<unknown>(`/packages/admin${toQueryString(params)}`);
  return parseApiResponse(
    paginatedAdminPackagesSchema,
    res,
    "Invalid packages response from server",
  );
}

/** `amount` is in **major** units (₦); the server stores minor units. */
export async function createPackage(
  body: CreatePackageInput,
): Promise<AdminPackage> {
  const res = await api<unknown>("/packages", { method: "POST", body });
  return parseApiResponse(
    adminPackageSchema,
    res,
    "Invalid package response from server",
  );
}

/** `amount`, when sent, is in **major** units (₦). */
export async function updatePackage(
  id: string,
  body: UpdatePackageInput,
): Promise<AdminPackage> {
  const res = await api<unknown>(`/packages/${id}`, { method: "PATCH", body });
  return parseApiResponse(
    adminPackageSchema,
    res,
    "Invalid package response from server",
  );
}

export async function syncPackageWithPaystack(
  id: string,
): Promise<AdminPackage> {
  const res = await api<unknown>(`/packages/${id}/sync-paystack`, {
    method: "POST",
  });
  return parseApiResponse(
    adminPackageSchema,
    res,
    "Invalid package response from server",
  );
}
