import { createFileRoute } from "@tanstack/react-router";
import { plansSearchSchema } from "@/lib/search-schemas";
import { PlansView } from "@/modules/plans";

export const Route = createFileRoute("/app/plans/")({
  validateSearch: (search) => plansSearchSchema.parse(search),
  component: PlansView,
});
