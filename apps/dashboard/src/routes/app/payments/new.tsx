import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { MakePaymentView } from "@/modules/payments/components/make-payment-view";

export const Route = createFileRoute("/app/payments/new")({
  validateSearch: planSearchSchema,
  component: MakePaymentView,
});
