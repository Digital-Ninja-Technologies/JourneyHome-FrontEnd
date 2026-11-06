import type { AdminOverviewQueryInput } from "@journeyhome/schemas";
import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { fetchOverview } from "./api";

export const overviewQueryOptions = (params?: AdminOverviewQueryInput) =>
  queryOptions({
    queryKey: ["overview", params] as const,
    queryFn: () => fetchOverview(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export function useOverview(params?: AdminOverviewQueryInput) {
  return useQuery(overviewQueryOptions(params));
}
