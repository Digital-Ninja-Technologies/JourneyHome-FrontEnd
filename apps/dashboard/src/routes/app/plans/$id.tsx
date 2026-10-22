import { createFileRoute } from "@tanstack/react-router";
import PlanDetail from "../../../pages/PlanDetail";

export const Route = createFileRoute("/app/plans/$id")({
  component: PlanDetail,
});
