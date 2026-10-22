import { createFileRoute } from "@tanstack/react-router";
import PaymentCallback from "../../../pages/PaymentCallback";

interface PaymentCallbackSearch {
  reference?: string;
  trxref?: string;
}

export const Route = createFileRoute("/app/payments/callback")({
  validateSearch: (search: Record<string, unknown>): PaymentCallbackSearch => ({
    reference: typeof search.reference === "string" ? search.reference : undefined,
    trxref: typeof search.trxref === "string" ? search.trxref : undefined,
  }),
  component: PaymentCallback,
});
