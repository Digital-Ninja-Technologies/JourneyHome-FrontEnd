import { type Package, packageSchema } from "@journeyhome/schemas";
import { z } from "zod";
import { api, parseApiResponse } from "@/lib/api";

const packageListSchema = z.array(packageSchema);

export async function fetchPackages(): Promise<Package[]> {
  const res = await api<unknown>("/packages");
  const packages = parseApiResponse(
    packageListSchema,
    res,
    "Invalid packages response from server",
  );
  return [...packages].sort((a, b) => a.amount - b.amount);
}

export async function fetchPackage(id: string): Promise<Package> {
  const res = await api<unknown>(`/packages/${encodeURIComponent(id)}`);
  return parseApiResponse(
    packageSchema,
    res,
    `Invalid package (${id}) response from server`,
  );
}
