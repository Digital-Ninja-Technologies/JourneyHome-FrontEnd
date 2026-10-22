import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import RequestService from "@/pages/request-service";

export const Route = createFileRoute("/app/service-requests/new")({
  validateSearch: (search) => planSearchSchema.parse(search),
  component: RequestService,
});
