import { createFileRoute } from "@tanstack/react-router";
import { paymentCallbackSearchSchema } from "@/lib/search-schemas";
import { PaymentCallbackView } from "@/modules/payments";

export const Route = createFileRoute("/app/payments/callback")({
  validateSearch: (search) => paymentCallbackSearchSchema.parse(search),
  component: PaymentCallbackView,
});
