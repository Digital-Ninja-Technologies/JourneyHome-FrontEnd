import { createFileRoute } from "@tanstack/react-router";
import { RequestServiceSkeleton } from "@/components/skeletons";
import { planSearchSchema } from "@/lib/search-schemas";
import { RequestServiceView } from "@/modules/service-requests/components/request-service-view";

export const Route = createFileRoute("/app/service-requests/new")({
  validateSearch: planSearchSchema,
  component: RequestServiceView,
  pendingComponent: RequestServiceSkeleton,
});
