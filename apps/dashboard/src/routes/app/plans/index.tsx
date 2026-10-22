import { createFileRoute } from "@tanstack/react-router";
import { plansSearchSchema } from "@/lib/search-schemas";
import Plans from "@/pages/plans";

export const Route = createFileRoute("/app/plans/")({
  validateSearch: (search) => plansSearchSchema.parse(search),
  component: Plans,
});
