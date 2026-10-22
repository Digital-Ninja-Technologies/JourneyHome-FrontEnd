import { queryOptions } from "@tanstack/react-query";
import { fetchPackages } from "./api";

export const packagesQueryOptions = () =>
  queryOptions({
    queryKey: ["packages"] as const,
    queryFn: () => fetchPackages(),
    staleTime: 5 * 60_000,
  });
