import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchPackage, fetchPackages } from "./api";

export const packagesQueryOptions = () =>
  queryOptions({
    queryKey: ["packages"] as const,
    queryFn: () => fetchPackages(),
    staleTime: 5 * 60_000,
  });

export const packageQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["package", id] as const,
    queryFn: () => fetchPackage(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });

export function usePackages() {
  return useQuery(packagesQueryOptions());
}

export function usePackage(id: string) {
  return useQuery(packageQueryOptions(id));
}
