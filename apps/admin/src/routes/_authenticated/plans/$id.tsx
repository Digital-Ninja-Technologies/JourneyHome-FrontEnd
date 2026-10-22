import { createFileRoute } from "@tanstack/react-router";
import PlanDetail from "@/pages/plan-detail";

export const Route = createFileRoute("/_authenticated/plans/$id")({
  component: PlanDetail,
});
