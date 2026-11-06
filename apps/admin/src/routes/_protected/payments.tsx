import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { paymentsSearchSchema } from "@/lib/search-schemas";
import { PaymentsView } from "@/modules/payments/components/payments-view";

export const Route = createFileRoute("/_protected/payments")({
  validateSearch: paymentsSearchSchema,
  component: PaymentsView,
  pendingComponent: () => <TableViewSkeleton kpis={3} />,
});
