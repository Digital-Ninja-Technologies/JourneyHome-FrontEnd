import { createFileRoute } from "@tanstack/react-router";
import { paymentCallbackSearchSchema } from "@/lib/search-schemas";
import PaymentCallback from "@/pages/payment-callback";

export const Route = createFileRoute("/app/payments/callback")({
  validateSearch: (search) => paymentCallbackSearchSchema.parse(search),
  component: PaymentCallback,
});
