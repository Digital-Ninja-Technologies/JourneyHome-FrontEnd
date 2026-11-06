import { createFileRoute } from "@tanstack/react-router";
import { DetailViewSkeleton } from "@/components/skeletons";
import { PlanDetailView } from "@/modules/plans/components/plan-detail-view";

export const Route = createFileRoute("/_protected/plans/$id")({
  component: PlanDetailView,
  pendingComponent: DetailViewSkeleton,
});
