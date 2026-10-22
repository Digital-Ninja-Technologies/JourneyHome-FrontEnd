import { queryOptions } from "@tanstack/react-query";
import { fetchMe } from "./api";

export const meQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["me", userId] as const,
    queryFn: () => fetchMe(),
    staleTime: 60_000,
    retry: false,
  });
