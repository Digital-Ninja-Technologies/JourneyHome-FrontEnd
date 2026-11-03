import type { Payment, Subscription } from "@journeyhome/schemas";
import { api } from "@/lib/api";
import type { Card } from "@/lib/api/mocks";

export async function fetchPayments(planId?: string): Promise<Payment[]> {
  const query = planId ? `?planId=${encodeURIComponent(planId)}` : "";
  const res = await api<Payment[] | { items: Payment[] }>(`/payments${query}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).items)) return (res as any).items;
  return [];
}

export async function fetchPayment(id: string): Promise<Payment> {
  return api<Payment>(`/payments/${id}`);
}

export async function fetchSavedCards(): Promise<Card[]> {
  return api<Card[]>("/payments/methods");
}

export async function initializePayment(
  data: unknown,
): Promise<{ authorizationUrl: string; reference: string }> {
  return api<{ authorizationUrl: string; reference: string }>(
    "/payments/initialize",
    {
      body: data,
    },
  );
}

export async function initializeCard(): Promise<{ authorizationUrl: string }> {
  return api<{ authorizationUrl: string }>("/payments/methods/initialize", {
    method: "POST",
  });
}

export async function deleteCard(id: string): Promise<{ removed: boolean }> {
  return api<{ removed: boolean }>(`/payments/methods/${id}`, {
    method: "DELETE",
  });
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const res = await api<Subscription[] | { items: Subscription[] }>(
    "/subscriptions",
  );
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).items)) return (res as any).items;
  return [];
}

export async function fetchSubscription(id: string): Promise<Subscription> {
  return api<Subscription>(`/subscriptions/${id}`);
}
