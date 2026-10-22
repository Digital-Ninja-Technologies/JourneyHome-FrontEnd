import { createFileRoute } from "@tanstack/react-router";
import Payments from "../../../pages/Payments";

interface PaymentsSearch {
  plan?: string;
}

export const Route = createFileRoute("/app/payments/")({
  validateSearch: (search: Record<string, unknown>): PaymentsSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: Payments,
});
