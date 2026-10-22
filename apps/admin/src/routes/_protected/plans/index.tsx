import { createFileRoute } from "@tanstack/react-router";
import Plans from "@/pages/plans";

export const Route = createFileRoute("/_protected/plans/")({
  component: Plans,
});
