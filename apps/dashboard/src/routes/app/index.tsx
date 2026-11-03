import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/modules/dashboard/components/dashboard-view";

export const Route = createFileRoute("/app/")({
  component: DashboardView,
});
