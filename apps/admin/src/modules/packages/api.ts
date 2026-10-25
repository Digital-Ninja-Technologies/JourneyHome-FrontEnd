import { api } from "@/lib/api";
import type { Package } from "@/lib/types";

export async function fetchAdminPackages(): Promise<Package[]> {
  return api<Package[]>("/packages/admin");
}

export async function updatePackage(
  id: string,
  patch: Partial<Package>,
): Promise<Package> {
  return api<Package>(`/packages/admin/${id}`, {
    method: "PATCH",
    body: patch,
  });
}
