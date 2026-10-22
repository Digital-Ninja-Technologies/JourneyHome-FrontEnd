import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import Payments from "@/pages/payments";

export const Route = createFileRoute("/app/payments/")({
  validateSearch: (search) => planSearchSchema.parse(search),
  component: Payments,
});
