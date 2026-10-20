import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { api } from "./api";
import type { AdminMe, AdminPayment, AdminUser, AuditEntry, Customer, Package, Plan, ServiceDocument, ServiceRequest } from "./types";

function useAdminQuery<T>(key: unknown[], path: string, enabled = true) {
  const { user } = useAuth();
  return useQuery({ queryKey: [...key, user?.id], queryFn: () => api<T>(path), enabled, staleTime: 30_000 });
}

export const useCustomers = () => useAdminQuery<Customer[]>(["customers"], "/auth/customers");
export const useAllPlans = () => useAdminQuery<Plan[]>(["plans"], "/plans/admin");
export const usePlan = (id?: string) => useAdminQuery<Plan>(["plan", id], `/plans/${id}`, !!id);
export const useAllRequests = () => useAdminQuery<ServiceRequest[]>(["requests"], "/service-requests/admin");
export const useRequest = (id?: string) =>
  useAdminQuery<{ request: ServiceRequest; documents: ServiceDocument[] }>(["request", id], `/service-requests/${id}`, !!id);
export const usePackages = () => useAdminQuery<Package[]>(["packages"], "/packages/admin");
export const useAdmins = (enabled: boolean) => useAdminQuery<AdminUser[]>(["admins"], "/auth/admins", enabled);

/** Lookup of customer id -> customer, since admin lists return owner ids rather than names. */
export function useDirectory() {
  const q = useCustomers();
  const byId = new Map((q.data ?? []).map((c) => [c._id, c]));
  return { ...q, byId, nameOf: (id: string) => byId.get(id)?.name ?? "Unknown user" };
}

export const useAdminPayments = () => useAdminQuery<AdminPayment[]>(["admin-payments"], "/payments/admin");
export const useAuditLog = () => useAdminQuery<AuditEntry[]>(["audit"], "/audit-logs");
export const useAdminMe = () => useAdminQuery<AdminMe>(["admin-me"], "/auth/me");
