import { queryOptions } from "@tanstack/react-query";
import { fetchAdminPackages } from "./api";

export const adminPackagesQueryOptions = () =>
  queryOptions({
    queryKey: ["packages"] as const,
    queryFn: () => fetchAdminPackages(),
  });
