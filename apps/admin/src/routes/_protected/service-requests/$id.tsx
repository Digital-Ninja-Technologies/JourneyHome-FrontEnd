import { createFileRoute } from "@tanstack/react-router";
import ServiceRequestDetail from "@/pages/service-request-detail";

export const Route = createFileRoute("/_protected/service-requests/$id")({
  component: ServiceRequestDetail,
});
