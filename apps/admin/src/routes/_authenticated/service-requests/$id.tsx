import { createFileRoute } from "@tanstack/react-router";
import ServiceRequestDetail from "@/pages/service-request-detail";

export const Route = createFileRoute("/_authenticated/service-requests/$id")({
  component: ServiceRequestDetail,
});
