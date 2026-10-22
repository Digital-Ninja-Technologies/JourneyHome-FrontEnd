import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import MakePayment from "@/pages/make-payment";

export const Route = createFileRoute("/app/payments/new")({
  validateSearch: (search) => planSearchSchema.parse(search),
  component: MakePayment,
});
