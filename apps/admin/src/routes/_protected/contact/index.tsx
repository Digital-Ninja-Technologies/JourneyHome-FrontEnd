import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { contactSearchSchema } from "@/lib/search-schemas";
import { ContactView } from "@/modules/contact/components/contact-view";

export const Route = createFileRoute("/_protected/contact/")({
  validateSearch: contactSearchSchema,
  component: ContactView,
  pendingComponent: TableViewSkeleton,
});
