import type { AdminPayment } from "@journeyhome/schemas";
import { PAYMENT_STATUS, statusOptions } from "@/components/status-pill";
import { downloadCsv } from "@/lib/csv";
import { firstName } from "@/lib/format";

/** The business doesn't issue refunds, so Refunded isn't offered as a filter. */
export const PAYMENT_STATUS_OPTIONS = statusOptions(PAYMENT_STATUS).filter(
  (o) => o.value !== "Refunded",
);

export const PURPOSE_LABEL: Record<string, string> = {
  initial_contribution: "First contribution",
  recurring_contribution: "Monthly contribution",
};

export const PURPOSE_OPTIONS = [
  { value: "initial_contribution", label: "First contribution" },
  { value: "recurring_contribution", label: "Monthly contribution" },
] as const;

export const planLabel = (p: AdminPayment) =>
  p.plan.coveredPerson
    ? `${firstName(p.plan.coveredPerson.fullName)}'s plan`
    : "—";

export function exportPaymentsCsv(
  rows: AdminPayment[],
  filename = "payments.csv",
) {
  downloadCsv(filename, [
    [
      "Date",
      "Customer",
      "Email",
      "Reference",
      "Plan",
      "Package",
      "Type",
      "Amount (minor units)",
      "Currency",
      "Status",
    ],
    ...rows.map((p) => [
      p.createdAt,
      p.owner.name,
      p.owner.email,
      p.reference,
      planLabel(p),
      p.plan.packageDetails?.name ?? "",
      PURPOSE_LABEL[p.purpose] ?? p.purpose,
      p.amount,
      p.currency,
      p.status,
    ]),
  ]);
}
