import { queryOptions, useQuery } from "@tanstack/react-query";
import { type FetchPackagesParams, fetchPackages } from "./api";

export const packagesQueryOptions = (
  params: FetchPackagesParams = { limit: 100 },
) =>
  queryOptions({
    queryKey: ["packages", "list", params] as const,
    queryFn: () => fetchPackages(params),
    staleTime: 60_000,
  });

export function usePackages(params?: FetchPackagesParams) {
  return useQuery(packagesQueryOptions(params));
}
