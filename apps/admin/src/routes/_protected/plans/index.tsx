import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { plansSearchSchema } from "@/lib/search-schemas";
import { PlansView } from "@/modules/plans/components/plans-view";

export const Route = createFileRoute("/_protected/plans/")({
  validateSearch: plansSearchSchema,
  component: PlansView,
  pendingComponent: TableViewSkeleton,
});
