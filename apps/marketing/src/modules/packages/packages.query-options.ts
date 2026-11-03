import { queryOptions } from "@tanstack/react-query";
import { getPackagesFn } from "./packages.functions";

export const packagesQueryOptions = () =>
  queryOptions({
    queryKey: ["marketing", "packages"] as const,
    queryFn: () => getPackagesFn(),
    staleTime: 1000 * 60 * 5,
  });
