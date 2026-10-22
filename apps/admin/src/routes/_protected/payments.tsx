import { createFileRoute } from "@tanstack/react-router";
import Payments from "@/pages/payments";

export const Route = createFileRoute("/_protected/payments")({
  component: Payments,
});
