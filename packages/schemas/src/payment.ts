import { z } from "zod";
import { PaymentStatusEnum } from "./enums";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";
import { userSummarySchema } from "./user";

/**
 * Customer payment record schema.
 * Aligned with OpenAPI components.schemas.Payment.
 */
export const paymentSchema = z.object({
  _id: z.string(),
  owner: z.string(),
  plan: z.string(),
  amount: z.number().int(),
  currency: z.string().default("NGN"),
  reference: z.string(),
  providerReference: z.string().optional(),
  provider: z.string().default("paystack"),
  purpose: z.string().default("recurring_contribution"),
  status: PaymentStatusEnum,
  providerTransactionId: z.string().optional(),
  processedAt: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});
export type Payment = z.infer<typeof paymentSchema>;

/**
 * Admin payment record with populated owner and plan.
 * Aligned with OpenAPI components.schemas.AdminPayment.
 */
export const adminPaymentSchema = z.object({
  _id: z.string(),
  owner: userSummarySchema,
  plan: z.object({
    _id: z.string(),
    coveredPerson: z
      .object({
        fullName: z.string(),
        relationship: z.string(),
      })
      .optional(),
    packageDetails: z
      .object({
        name: z.string(),
        amount: z.number().int(),
        currency: z.string(),
      })
      .optional(),
  }),
  reference: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  purpose: z.string(),
  status: PaymentStatusEnum,
  createdAt: z.string(),
});
export type AdminPayment = z.infer<typeof adminPaymentSchema>;

/**
 * Payload data returned inside InitializeCheckoutResponse.
 * Aligned with OpenAPI components.schemas.InitializeCheckoutResponse.
 */
export const checkoutInitializeSchema = z.object({
  paymentId: z.string(),
  reference: z.string(),
  authorizationUrl: z.string().url(),
  accessCode: z.string(),
});
export type CheckoutInitializeResult = z.infer<typeof checkoutInitializeSchema>;

/**
 * Subscription record aligned with OpenAPI components.schemas.Subscription.
 */
export const subscriptionSchema = z
  .object({
    _id: z.string().optional(),
    status: z.string().optional(),
    nextPaymentDate: z.string().nullable().optional(),
  })
  .passthrough();
export type Subscription = z.infer<typeof subscriptionSchema>;

/**
 * Query schema for `GET /payments`.
 */
export const paymentQuerySchema = paginationQuerySchema.extend({
  status: PaymentStatusEnum.optional(),
  plan: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;

/**
 * Paginated payments result schema.
 */
export const paginatedPaymentsSchema = createPaginatedDataSchema(paymentSchema);
export type PaginatedPayments = z.infer<typeof paginatedPaymentsSchema>;

/**
 * Paginated subscriptions result schema.
 */
export const paginatedSubscriptionsSchema =
  createPaginatedDataSchema(subscriptionSchema);
export type PaginatedSubscriptions = z.infer<
  typeof paginatedSubscriptionsSchema
>;
