import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/modules/notifications";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsView,
});
