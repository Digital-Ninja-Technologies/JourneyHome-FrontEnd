import { createFileRoute } from "@tanstack/react-router";
import Notifications from "../../pages/Notifications";

export const Route = createFileRoute("/app/notifications")({
  component: Notifications,
});
