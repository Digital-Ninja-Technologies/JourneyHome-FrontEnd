import { createFileRoute } from "@tanstack/react-router";
import { NotificationsListSkeleton } from "@/components/skeletons";
import { NotificationsView } from "@/modules/notifications/components/notifications-view";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsView,
  pendingComponent: NotificationsListSkeleton,
});
