import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestsView } from "@/modules/service-requests";

export const Route = createFileRoute("/app/service-requests/")({
  component: ServiceRequestsView,
});
