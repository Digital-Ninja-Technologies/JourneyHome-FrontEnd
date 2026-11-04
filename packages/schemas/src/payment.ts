import { z } from "zod";
import { PaymentStatusEnum } from "./enums";

export const basePaymentSchema = z.object({
  _id: z.string(),
  plan: z.string().optional(),
  planId: z.string().optional(),
  amount: z.number().optional(),
  amountMinor: z.number().optional(),
  currency: z.string().default("NGN"),
  purpose: z.string().optional().default("recurring_contribution"),
  status: PaymentStatusEnum,
  reference: z.string().optional(),
  failureMessage: z.string().optional(),
  processedAt: z.string().optional(),
  createdAt: z.string(),
});

export const paymentSchema = basePaymentSchema.transform((p) => ({
  ...p,
  plan: p.plan || p.planId || "",
  planId: p.planId || p.plan || "",
  amountMinor: p.amountMinor ?? p.amount ?? 0,
}));
export type Payment = z.infer<typeof paymentSchema>;

export const paymentsListResponseSchema = z.union([
  z.object({ items: z.array(paymentSchema) }).transform((r) => r.items),
  z.array(paymentSchema),
]);

export const adminPaymentSchema = basePaymentSchema
  .extend({
    owner: z.string(),
    ownerName: z.string().optional(),
    planName: z.string().optional(),
  })
  .transform((p) => ({
    ...p,
    plan: p.plan || p.planId || "",
    planId: p.planId || p.plan || "",
    amountMinor: p.amountMinor ?? p.amount ?? 0,
  }));
export type AdminPayment = z.infer<typeof adminPaymentSchema>;

export const savedCardSchema = z.object({
  _id: z.string(),
  brand: z.string(),
  last4: z.string(),
  expMonth: z.number(),
  expYear: z.number(),
  isDefault: z.boolean(),
});
export type SavedCard = z.infer<typeof savedCardSchema>;

export const checkoutInitializeSchema = z.object({
  paymentId: z.string().optional(),
  reference: z.string().optional(),
  authorizationUrl: z.string(),
  accessCode: z.string().optional(),
});
export type CheckoutInitializeResult = z.infer<typeof checkoutInitializeSchema>;

export const subscriptionSchema = z
  .object({
    _id: z.string(),
    plan: z.string().optional(),
    planId: z.string().optional(),
    status: z.string(),
    amountMinor: z.number().optional().default(0),
    currency: z.string().default("NGN").optional(),
    nextBillingDate: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .transform((s) => ({
    ...s,
    plan: s.plan || s.planId || "",
    planId: s.planId || s.plan || "",
    createdAt: s.createdAt || new Date().toISOString(),
  }));
export type Subscription = z.infer<typeof subscriptionSchema>;

export const subscriptionsListResponseSchema = z.union([
  z.object({ items: z.array(subscriptionSchema) }).transform((r) => r.items),
  z.array(subscriptionSchema),
]);
