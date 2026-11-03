import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestsView } from "@/modules/service-requests/components/service-requests-view";

export const Route = createFileRoute("/app/service-requests/")({
  component: ServiceRequestsView,
});
