import type { Package } from "@journeyhome/schemas";
import { api } from "@/lib/api";

export async function fetchPackages(): Promise<Package[]> {
  const res = await api<Package[] | { data: Package[] }>("/packages");
  const packages: Package[] = Array.isArray(res)
    ? res
    : res && Array.isArray((res as any).data)
      ? (res as any).data
      : [];
  return packages.sort((a, b) => a.amount - b.amount);
}
