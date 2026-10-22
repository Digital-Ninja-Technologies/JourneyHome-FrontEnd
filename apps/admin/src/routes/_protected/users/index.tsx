import { createFileRoute } from "@tanstack/react-router";
import Users from "@/pages/users";

export const Route = createFileRoute("/_protected/users/")({
  component: Users,
});
