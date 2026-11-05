import {
  type Payment,
  paginatedPaymentsSchema,
  paginatedSubscriptionsSchema,
  paymentSchema,
  type Subscription,
  subscriptionSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export interface FetchPaymentsParams {
  planId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function fetchPayments(
  params?: FetchPaymentsParams | string,
): Promise<Payment[]> {
  const query = new URLSearchParams();
  if (typeof params === "string") {
    if (params) query.set("plan", params);
  } else if (params) {
    if (params.planId) query.set("plan", params.planId);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
  }

  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await api<unknown>(`/payments${qs}`);
  const parsed = parseApiResponse(
    paginatedPaymentsSchema,
    res,
    "Invalid payments response from server",
  );
  return parsed.items;
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

export interface FetchSubscriptionsParams {
  planId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function fetchSubscriptions(
  params?: FetchSubscriptionsParams,
): Promise<Subscription[]> {
  const query = new URLSearchParams();
  if (params) {
    if (params.planId) query.set("planId", params.planId);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
  }
  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await api<unknown>(`/subscriptions${qs}`);
  const parsed = parseApiResponse(
    paginatedSubscriptionsSchema,
    res,
    "Invalid subscriptions response from server",
  );
  return parsed.items;
}

export async function fetchSubscription(id: string): Promise<Subscription> {
  const res = await api<unknown>(`/subscriptions/${id}`);
  return parseApiResponse(
    subscriptionSchema,
    res,
    `Invalid subscription (${id}) response from server`,
  );
}
