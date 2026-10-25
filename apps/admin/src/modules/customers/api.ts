import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";

export async function fetchCustomers(): Promise<Customer[]> {
  return api<Customer[]>("/auth/customers");
}

export async function fetchCustomer(id: string): Promise<Customer> {
  return api<Customer>(`/auth/customers/${id}`);
}
