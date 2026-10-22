import { createFileRoute } from "@tanstack/react-router";
import ServiceRequests from "@/pages/service-requests";

export const Route = createFileRoute("/_authenticated/service-requests/")({
  component: ServiceRequests,
});
