import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { notificationsSearchSchema } from "@/lib/search-schemas";
import { NotificationsView } from "@/modules/notifications/components/notifications-view";

export const Route = createFileRoute("/_protected/notifications")({
  validateSearch: notificationsSearchSchema,
  component: NotificationsView,
  pendingComponent: TableViewSkeleton,
});
