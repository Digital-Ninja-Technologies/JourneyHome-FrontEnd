import { createFileRoute } from "@tanstack/react-router";
import { PlanDetailView } from "@/modules/plans";

export const Route = createFileRoute("/app/plans/$id")({
  component: PlanDetailView,
});
