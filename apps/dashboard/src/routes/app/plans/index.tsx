import { createFileRoute } from "@tanstack/react-router";
import { plansSearchSchema } from "@/lib/search-schemas";
import { PlansView } from "@/modules/plans/components/plans-view";

export const Route = createFileRoute("/app/plans/")({
  validateSearch: plansSearchSchema,
  component: PlansView,
});
