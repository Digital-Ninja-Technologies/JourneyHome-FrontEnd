import { createFileRoute } from "@tanstack/react-router";
import { DashboardSkeleton } from "@/components/skeletons";
import { DashboardView } from "@/modules/dashboard/components/dashboard-view";

export const Route = createFileRoute("/app/")({
  component: DashboardView,
  pendingComponent: DashboardSkeleton,
});
