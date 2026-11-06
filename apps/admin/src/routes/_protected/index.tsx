import { createFileRoute } from "@tanstack/react-router";
import { OverviewSkeleton } from "@/components/skeletons";
import { overviewSearchSchema } from "@/lib/search-schemas";
import { OverviewView } from "@/modules/overview/components/overview-view";

export const Route = createFileRoute("/_protected/")({
  validateSearch: overviewSearchSchema,
  component: OverviewView,
  pendingComponent: OverviewSkeleton,
});
