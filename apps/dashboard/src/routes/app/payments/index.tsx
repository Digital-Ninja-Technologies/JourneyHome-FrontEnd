import { createFileRoute } from "@tanstack/react-router";
import Payments from "../../../pages/Payments";

interface PaymentsSearch {
  plan?: string;
}

export const Route = createFileRoute("/app/payments/")({
  validateSearch: (search: Record<string, unknown>): PaymentsSearch => ({
    plan: search.plan != null ? String(search.plan) : undefined,
  }),
  component: Payments,
});
