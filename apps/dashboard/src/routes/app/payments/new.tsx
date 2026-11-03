import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { MakePaymentView } from "@/modules/payments";

export const Route = createFileRoute("/app/payments/new")({
  validateSearch: (search) => planSearchSchema.parse(search),
  component: MakePaymentView,
});
