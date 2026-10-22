import { createFileRoute } from "@tanstack/react-router";
import Notifications from "@/pages/notifications";

export const Route = createFileRoute("/app/notifications")({
  component: Notifications,
});
