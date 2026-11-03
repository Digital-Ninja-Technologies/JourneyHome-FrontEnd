import { z } from "zod";
import { PaymentPurposeEnum, PaymentStatusEnum } from "./enums";

export const paymentSchema = z.object({
  _id: z.string(),
  plan: z.string(),
  amountMinor: z.number(),
  currency: z.string().default("NGN"),
  purpose: PaymentPurposeEnum,
  status: PaymentStatusEnum,
  reference: z.string().optional(),
  failureMessage: z.string().optional(),
  processedAt: z.string().optional(),
  createdAt: z.string(),
});
export type Payment = z.infer<typeof paymentSchema>;

export const adminPaymentSchema = paymentSchema.extend({
  owner: z.string(),
  ownerName: z.string().optional(),
  planName: z.string().optional(),
});
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

export const subscriptionSchema = z.object({
  _id: z.string(),
  plan: z.string(),
  status: z.string(),
  amountMinor: z.number(),
  currency: z.string().default("NGN").optional(),
  nextBillingDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;
