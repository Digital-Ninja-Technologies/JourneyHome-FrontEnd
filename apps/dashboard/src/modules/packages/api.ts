import { type Package, packagesListResponseSchema } from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export async function fetchPackages(): Promise<Package[]> {
  const res = await api<unknown>("/packages");
  const packages = parseApiResponse(
    packagesListResponseSchema,
    res,
    "Invalid packages response from server",
  );
  return [...packages].sort((a, b) => a.amount - b.amount);
}
