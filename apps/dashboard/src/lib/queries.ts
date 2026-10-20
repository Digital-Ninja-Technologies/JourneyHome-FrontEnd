import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { api } from "./api";
import type { Package, Payment, Plan, ServiceDocument, ServiceRequest } from "./types";

export function usePlans() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["plans", user?.id], queryFn: () => api<Plan[]>("/plans"), staleTime: 30_000 });
}

export function usePayments() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["payments", user?.id], queryFn: () => api<Payment[]>("/payments"), staleTime: 30_000 });
}

export function usePlan(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({ queryKey: ["plan", user?.id, id], queryFn: () => api<Plan>(`/plans/${id}`), enabled: !!id });
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () => (await api<Package[]>("/packages")).sort((a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor),
    staleTime: 5 * 60_000,
  });
}

export function useServiceRequests() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["service-requests", user?.id], queryFn: () => api<ServiceRequest[]>("/service-requests"), staleTime: 30_000 });
}

export function useServiceRequest(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["service-request", user?.id, id],
    queryFn: () => api<{ request: ServiceRequest; documents: ServiceDocument[] }>(`/service-requests/${id}`),
  });
}
