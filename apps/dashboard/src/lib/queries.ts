import { useQuery } from "@tanstack/react-query";
import { useSessionUser } from "@/modules/auth";
import { api } from "./api";
import type {
  AppNotification,
  Package,
  Payment,
  Plan,
  ServiceDocument,
  ServiceRequest,
} from "./types";

export function usePlans() {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["plans", user?.id],
    queryFn: () => api<Plan[]>("/plans"),
    staleTime: 30_000,
  });
}

export function usePayments() {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["payments", user?.id],
    queryFn: () => api<Payment[]>("/payments"),
    staleTime: 30_000,
  });
}

export function usePlan(id: string | undefined) {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["plan", user?.id, id],
    queryFn: () => api<Plan>(`/plans/${id}`),
    enabled: !!id,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () =>
      (await api<Package[]>("/packages")).sort(
        (a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor,
      ),
    staleTime: 5 * 60_000,
  });
}

export function useServiceRequests() {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["service-requests", user?.id],
    queryFn: () => api<ServiceRequest[]>("/service-requests"),
    staleTime: 30_000,
  });
}

export function useServiceRequest(id: string) {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["service-request", user?.id, id],
    queryFn: () =>
      api<{ request: ServiceRequest; documents: ServiceDocument[] }>(
        `/service-requests/${id}`,
      ),
  });
}

export function useNotifications() {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => api<AppNotification[]>("/notifications"),
    staleTime: 30_000,
  });
}

export interface Me {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  preferences: {
    paymentReminders: boolean;
    deficitAlerts: boolean;
    serviceUpdates: boolean;
    productNews: boolean;
  };
}
export interface SavedCard {
  _id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export function useMe() {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => api<Me>("/auth/me"),
    staleTime: 60_000,
    retry: false,
  });
}

export function useSavedCards() {
  const user = useSessionUser();
  return useQuery({
    queryKey: ["cards", user?.id],
    queryFn: () => api<SavedCard[]>("/payments/methods"),
    retry: false,
  });
}
