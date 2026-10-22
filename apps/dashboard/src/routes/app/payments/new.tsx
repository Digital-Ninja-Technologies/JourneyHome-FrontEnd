import { createFileRoute } from "@tanstack/react-router";
import MakePayment from "../../../pages/MakePayment";

interface MakePaymentSearch {
  plan?: string;
}

export const Route = createFileRoute("/app/payments/new")({
  validateSearch: (search: Record<string, unknown>): MakePaymentSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: MakePayment,
});
