import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestDetailSkeleton } from "@/components/skeletons";
import { ServiceRequestDetailView } from "@/modules/service-requests/components/service-request-detail-view";

export const Route = createFileRoute("/app/service-requests/$id")({
  component: ServiceRequestDetailView,
  pendingComponent: ServiceRequestDetailSkeleton,
});
