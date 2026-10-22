import { queryOptions } from "@tanstack/react-query";
import { fetchAdmins } from "./api";

export const adminsQueryOptions = (enabled = true) =>
  queryOptions({
    queryKey: ["admins"] as const,
    queryFn: () => fetchAdmins(),
    enabled,
  });
