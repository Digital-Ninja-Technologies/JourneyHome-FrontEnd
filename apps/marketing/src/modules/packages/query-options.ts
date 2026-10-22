import { queryOptions } from "@tanstack/react-query";
import { getPackages } from "../../lib/packages";

export const packagesQueryOptions = () =>
  queryOptions({
    queryKey: ["marketing", "packages"] as const,
    queryFn: () => getPackages(),
    staleTime: 1000 * 60 * 5,
  });
