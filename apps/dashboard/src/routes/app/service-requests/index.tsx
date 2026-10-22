import { createFileRoute } from "@tanstack/react-router";
import ServiceRequests from "../../../pages/ServiceRequests";

export const Route = createFileRoute("/app/service-requests/")({
  component: ServiceRequests,
});
