import { api } from "@/lib/api";
import type { Package } from "@journeyhome/schemas";

export async function fetchPackages(): Promise<Package[]> {
  const packages = await api<Package[]>("/packages");
  return packages.sort((a, b) => a.amount - b.amount);
}
