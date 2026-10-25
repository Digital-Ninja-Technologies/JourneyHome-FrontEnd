import { queryOptions } from "@tanstack/react-query";
import { fetchCustomer, fetchCustomers } from "./api";

export const customersQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["customers", userId] as const,
    queryFn: () => fetchCustomers(),
    staleTime: 30_000,
  });

export const customerQueryOptions = (id?: string, userId?: string) =>
  queryOptions({
    queryKey: ["customer", userId, id] as const,
    queryFn: () =>
      id ? fetchCustomer(id) : Promise.reject(new Error("No customer ID")),
    enabled: Boolean(id),
  });
