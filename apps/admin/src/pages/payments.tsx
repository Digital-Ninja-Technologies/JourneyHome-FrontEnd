import { Select } from "@journeyhome/ui/components/select";
import { cn } from "@journeyhome/ui/lib/utils";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { DemoNotice } from "@/components/demo-notice";
import {
  PageHeader,
  Pill,
  QueryError,
  SearchBox,
  type Tone,
} from "@/components/ui";
import { isUnsupported, UNSUPPORTED_MESSAGE } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatMoney, isThisMonth } from "@/lib/format";
import { useAdminPayments, useAllPlans, useDirectory } from "@/lib/queries";
import type { AdminPayment, PaymentStatus } from "@/lib/types";

const TONE: Record<PaymentStatus, Tone> = {
  Successful: "active",
  Pending: "due",
  Processing: "due",
  Failed: "cancelled",
  Refunded: "paused",
  Cancelled: "paused",
};
const STATUSES: PaymentStatus[] = [
  "Successful",
  "Pending",
  "Processing",
  "Failed",
  "Refunded",
  "Cancelled",
];
const PAGE = 20;
const when = (p: AdminPayment) => p.processedAt ?? p.createdAt;

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[2px] text-muted">
        {label}
      </div>
      <div className={cn("mt-1 font-serif text-[30px] leading-tight", tone)}>
        {value}
      </div>
    </div>
  );
}

export default function Payments() {
  const q = useAdminPayments();
  const dir = useDirectory();
  const plansQ = useAllPlans();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [shown, setShown] = useState(PAGE);

  const plans = new Map((plansQ.data ?? []).map((p) => [p._id, p]));
  const ownerOf = (p: AdminPayment) => p.ownerName ?? dir.nameOf(p.owner);
  const planOf = (p: AdminPayment) =>
    p.planName ??
    (plans.get(p.plan)
      ? `${plans.get(p.plan)?.coveredPerson.fullName.split(" ")[0]}'s plan`
      : "—");

  const all = [...(q.data ?? [])].sort(
    (a, b) => +new Date(when(b)) - +new Date(when(a)),
  );
  const needle = search.trim().toLowerCase();
  const rows = all.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (!needle ||
        [ownerOf(p), p.reference, planOf(p)].some((t) =>
          t.toLowerCase().includes(needle),
        )),
  );

  const sum = (f: (p: AdminPayment) => boolean) =>
    all.filter(f).reduce((n, p) => n + p.amountMinor, 0);
  const month = new Date().toLocaleString("en-GB", { month: "short" });

  if (q.isError && isUnsupported(q.error)) {
    return (
      <main className="flex max-w-[720px] flex-col gap-6 p-4 sm:p-6 md:p-10">
        <PageHeader title="Payments" />
        <section className="rounded-3xl border border-dashed border-foreground/30 p-8">
          <div className="font-serif text-2xl">Not available yet</div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {UNSUPPORTED_MESSAGE} It needs an admin payments endpoint (
            <code>GET /payments/admin</code>).
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 md:p-10">
      <PageHeader
        title="Payments"
        aside={
          <button
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv("payments.csv", [
                [
                  "Date",
                  "User",
                  "Reference",
                  "Plan",
                  "Type",
                  "Amount (minor units)",
                  "Currency",
                  "Status",
                ],
                ...rows.map((p) => [
                  when(p),
                  ownerOf(p),
                  p.reference,
                  planOf(p),
                  p.purpose === "initial_contribution"
                    ? "First contribution"
                    : "Monthly contribution",
                  p.amountMinor,
                  p.currency,
                  p.status,
                ]),
              ])
            }
            className="h-11 rounded-xl border border-foreground px-5 text-sm font-bold disabled:opacity-40"
          >
            Export CSV
          </button>
        }
      />
      <DemoNotice />
      {q.isError && (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      )}
      <section
        aria-label="Totals"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Kpi
          label={`Collected (${month})`}
          value={formatMoney(
            sum((p) => p.status === "Successful" && isThisMonth(when(p))),
          )}
        />
        <Kpi
          label="Pending"
          value={formatMoney(
            sum((p) => p.status === "Pending" || p.status === "Processing"),
          )}
          tone="text-status-due"
        />
        <Kpi
          label="Failed"
          value={formatMoney(sum((p) => p.status === "Failed"))}
          tone="text-status-cancelled"
        />
        <Kpi
          label={`Refunded (${month})`}
          value={formatMoney(
            sum((p) => p.status === "Refunded" && isThisMonth(when(p))),
          )}
          tone="text-muted"
        />
      </section>
      <div className="flex flex-wrap gap-3">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setShown(PAGE);
          }}
          placeholder="Search by user, reference, or plan…"
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setShown(PAGE);
          }}
          className="h-11 w-auto min-w-[150px] bg-white"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white p-4 sm:p-6">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted">
              {[
                "User",
                "Reference",
                "Plan",
                "Date",
                "Type",
                "Amount",
                "Status",
              ].map((h) => (
                <th key={h} className="px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, shown).map((p) => (
              <tr key={p._id} className="border-t border-border">
                <td className="px-3 py-4 font-bold">
                  {plans.has(p.plan) || dir.byId.has(p.owner) ? (
                    <Link
                      to="/users/$id"
                      params={{ id: p.owner }}
                      className="hover:underline"
                    >
                      {ownerOf(p)}
                    </Link>
                  ) : (
                    ownerOf(p)
                  )}
                </td>
                <td className="px-3 py-4 font-mono text-xs text-ink-soft">
                  {p.reference}
                </td>
                <td className="px-3 py-4 text-ink-soft">
                  {plans.has(p.plan) ? (
                    <Link
                      to="/plans/$id"
                      params={{ id: p.plan }}
                      className="hover:underline"
                    >
                      {planOf(p)}
                    </Link>
                  ) : (
                    planOf(p)
                  )}
                </td>
                <td className="px-3 py-4 text-ink-soft">
                  {formatDate(when(p))}
                </td>
                <td className="px-3 py-4 text-ink-soft">
                  {p.purpose === "initial_contribution" ? "First" : "Monthly"}
                </td>
                <td className="px-3 py-4 font-bold">
                  {formatMoney(p.amountMinor, p.currency)}
                </td>
                <td className="px-3 py-4">
                  <Pill label={p.status} tone={TONE[p.status]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.isPending && (
          <p className="py-6 text-center text-sm text-muted">
            Loading payments…
          </p>
        )}
        {q.isSuccess && rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            No payments match.
          </p>
        )}
        {rows.length > shown && (
          <div className="border-t border-border pt-4 text-center">
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="text-sm font-semibold text-link underline"
            >
              Load more transactions
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
