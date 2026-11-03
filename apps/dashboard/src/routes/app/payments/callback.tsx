import { createFileRoute } from "@tanstack/react-router";
import { paymentCallbackSearchSchema } from "@/lib/search-schemas";
import { PaymentCallbackView } from "@/modules/payments/components/payment-callback-view";

export const Route = createFileRoute("/app/payments/callback")({
  validateSearch: paymentCallbackSearchSchema,
  component: PaymentCallbackView,
});
