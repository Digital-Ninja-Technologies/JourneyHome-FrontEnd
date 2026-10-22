import { createFileRoute } from "@tanstack/react-router";
import PaymentCallback from "../../../pages/PaymentCallback";

interface PaymentCallbackSearch {
  reference?: string;
  trxref?: string;
}

export const Route = createFileRoute("/app/payments/callback")({
  validateSearch: (search: Record<string, unknown>): PaymentCallbackSearch => ({
    reference: search.reference != null ? String(search.reference) : undefined,
    trxref: search.trxref != null ? String(search.trxref) : undefined,
  }),
  component: PaymentCallback,
});
