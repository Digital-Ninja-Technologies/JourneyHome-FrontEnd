import { api } from "@/lib/api";
import type { Payment } from "@/lib/types";
import type { Card } from "@/mocks";

export async function fetchPayments(): Promise<Payment[]> {
  return api<Payment[]>("/payments");
}

export async function fetchSavedCards(): Promise<Card[]> {
  return api<Card[]>("/payments/methods");
}

export async function initializePayment(data: unknown): Promise<{ authorizationUrl: string; reference: string }> {
  return api<{ authorizationUrl: string; reference: string }>("/payments/initialize", {
    body: data,
  });
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
