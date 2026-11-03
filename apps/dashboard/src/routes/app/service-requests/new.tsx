import { createFileRoute } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { RequestServiceView } from "@/modules/service-requests";

export const Route = createFileRoute("/app/service-requests/new")({
  validateSearch: (search) => planSearchSchema.parse(search),
  component: RequestServiceView,
});
