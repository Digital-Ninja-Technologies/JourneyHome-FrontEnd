import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAdmins } from "./api";

export const adminsQueryOptions = () =>
  queryOptions({
    queryKey: ["admins"] as const,
    queryFn: () => fetchAdmins(),
    staleTime: 60_000,
  });

export function useAdmins({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...adminsQueryOptions(), enabled });
}
