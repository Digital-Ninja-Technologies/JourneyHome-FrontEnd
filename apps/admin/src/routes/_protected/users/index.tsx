import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { usersSearchSchema } from "@/lib/search-schemas";
import { UsersView } from "@/modules/users/components/users-view";

export const Route = createFileRoute("/_protected/users/")({
  validateSearch: usersSearchSchema,
  component: UsersView,
  pendingComponent: TableViewSkeleton,
});
