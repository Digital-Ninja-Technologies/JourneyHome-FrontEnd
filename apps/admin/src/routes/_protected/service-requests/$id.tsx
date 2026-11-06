import { createFileRoute } from "@tanstack/react-router";
import { DetailViewSkeleton } from "@/components/skeletons";
import { ServiceRequestDetailView } from "@/modules/service-requests/components/service-request-detail-view";

export const Route = createFileRoute("/_protected/service-requests/$id")({
  component: ServiceRequestDetailView,
  pendingComponent: DetailViewSkeleton,
});
