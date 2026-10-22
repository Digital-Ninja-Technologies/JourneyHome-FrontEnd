import { createFileRoute } from "@tanstack/react-router";
import MakePayment from "../../../pages/MakePayment";

interface MakePaymentSearch {
  plan?: string;
}

export const Route = createFileRoute("/app/payments/new")({
  validateSearch: (search: Record<string, unknown>): MakePaymentSearch => ({
    plan: search.plan != null ? String(search.plan) : undefined,
  }),
  component: MakePayment,
});
