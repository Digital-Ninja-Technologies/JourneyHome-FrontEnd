import { createFileRoute } from "@tanstack/react-router";
import { PlanDetailView } from "@/modules/plans/components/plan-detail-view";

export const Route = createFileRoute("/app/plans/$id")({
  component: PlanDetailView,
});
