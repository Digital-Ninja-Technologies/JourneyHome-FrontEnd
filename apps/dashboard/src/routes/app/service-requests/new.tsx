import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { RequestServiceView } from "@/modules/service-requests/components/request-service-view";

export const Route = createFileRoute("/app/service-requests/new")({
  validateSearch: planSearchSchema,
  component: RequestServiceView,
});
