import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { PaymentsView } from "@/modules/payments/components/payments-view";

export const Route = createFileRoute("/app/payments/")({
  validateSearch: planSearchSchema,
  component: PaymentsView,
});
