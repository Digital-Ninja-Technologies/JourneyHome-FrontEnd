import {
  type Payment,
  paymentSchema,
  paymentsListResponseSchema,
  type Subscription,
  subscriptionSchema,
  subscriptionsListResponseSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";
import type { Card } from "@/lib/api/mocks";

export async function fetchPayments(planId?: string): Promise<Payment[]> {
  const query = planId ? `?planId=${encodeURIComponent(planId)}` : "";
  const res = await api<unknown>(`/payments${query}`);
  return parseApiResponse(
    paymentsListResponseSchema,
    res,
    "Invalid payments response from server",
  );
}

export async function fetchPayment(id: string): Promise<Payment> {
  const res = await api<unknown>(`/payments/${id}`);
  return parseApiResponse(
    paymentSchema,
    res,
    `Invalid payment (${id}) response from server`,
  );
}

export async function verifyPayment(reference: string): Promise<Payment> {
  const res = await api<unknown>(
    `/payments/verify/${encodeURIComponent(reference)}`,
    {
      method: "POST",
    },
  );
  return parseApiResponse(
    paymentSchema,
    res,
    "Invalid payment verification response from server",
  );
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
  const res = await api<unknown>("/subscriptions");
  return parseApiResponse(
    subscriptionsListResponseSchema,
    res,
    "Invalid subscriptions response from server",
  );
}

export async function fetchSubscription(id: string): Promise<Subscription> {
  const res = await api<unknown>(`/subscriptions/${id}`);
  return parseApiResponse(
    subscriptionSchema,
    res,
    `Invalid subscription (${id}) response from server`,
  );
}
