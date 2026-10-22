import { createFileRoute } from "@tanstack/react-router";
import Payments from "@/pages/payments";

export const Route = createFileRoute("/_authenticated/payments")({
  component: Payments,
});
