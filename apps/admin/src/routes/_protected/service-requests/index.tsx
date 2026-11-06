import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { serviceRequestsSearchSchema } from "@/lib/search-schemas";
import { ServiceRequestsView } from "@/modules/service-requests/components/service-requests-view";

export const Route = createFileRoute("/_protected/service-requests/")({
  validateSearch: serviceRequestsSearchSchema,
  component: ServiceRequestsView,
  pendingComponent: TableViewSkeleton,
});
