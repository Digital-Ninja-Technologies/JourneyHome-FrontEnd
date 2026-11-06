import type { AdminPayment } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import {
  DataTableFilter,
  DataTableToolbar,
} from "@/components/data-table/data-table-toolbar";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { KpiRowSkeleton } from "@/components/skeletons";
import { matchPreset, PERIOD_PRESETS, presetRange } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import type { PaymentsSearch } from "@/lib/search-schemas";
import {
  exportPaymentsCsv,
  PAYMENT_STATUS_OPTIONS,
  PURPOSE_OPTIONS,
} from "../payments.utils";
import { usePayments } from "../query-options";
import { PaymentDetailsSheet } from "./payment-details-sheet";
import { PaymentsTable } from "./payments-table";

export function PaymentsView() {
  const search = useSearch({ from: "/_protected/payments" });
  const navigate = useNavigate({ from: "/payments" });
  const paymentsQ = usePayments(search);
  const [selected, setSelected] = useState<AdminPayment | null>(null);

  const setSearch = (patch: Partial<PaymentsSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const setFilter = (patch: Partial<PaymentsSearch>) =>
    setSearch({ ...patch, page: undefined });

  const hasActiveFilters = Boolean(
    search.search ||
      search.status ||
      search.purpose ||
      search.from ||
      search.to,
  );
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  const preset = matchPreset(search.from, search.to);
  const summary = paymentsQ.data?.summary ?? {};
  const total = (...statuses: string[]) =>
    statuses.reduce((n, s) => n + (summary[s]?.amount ?? 0), 0);
  const count = (...statuses: string[]) =>
    statuses.reduce((n, s) => n + (summary[s]?.count ?? 0), 0);
  const periodLabel = preset
    ? PERIOD_PRESETS.find((p) => p.value === preset)?.label.toLowerCase()
    : search.from || search.to
      ? "selected period"
      : "all time";
  const rows = paymentsQ.data?.items ?? [];

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Every contribution across all plans."
        actions={
          <Button
            variant="outline"
            size="lg"
            disabled={rows.length === 0}
            onClick={() => exportPaymentsCsv(rows)}
          >
            <Download />
            Export page as CSV
          </Button>
        }
      />

      {paymentsQ.isPending ? (
        <KpiRowSkeleton count={3} />
      ) : (
        <section aria-label="Totals" className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Collected"
            value={formatMoney(total("Successful"))}
            sub={`${count("Successful")} payments · ${periodLabel}`}
          />
          <KpiCard
            label="Pending"
            value={formatMoney(total("Pending", "Processing"))}
            sub={`${count("Pending", "Processing")} awaiting confirmation`}
            tone="due"
          />
          <KpiCard
            label="Failed"
            value={formatMoney(total("Failed"))}
            sub={`${count("Failed")} failed · ${periodLabel}`}
            tone="danger"
          />
        </section>
      )}

      {paymentsQ.isError && !paymentsQ.data ? (
        <ComponentErrorState
          title="Couldn't load payments"
          error={paymentsQ.error}
          onRetry={() => void paymentsQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            search={search.search}
            onSearchChange={(value) => setFilter({ search: value })}
            searchPlaceholder="Search customer, reference, or covered person"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          >
            <DataTableFilter
              label="Period"
              allLabel={search.from || search.to ? "Custom" : "All time"}
              value={preset}
              options={PERIOD_PRESETS}
              onChange={(p) =>
                setFilter(
                  p ? presetRange(p) : { from: undefined, to: undefined },
                )
              }
            />
            <DataTableFilter
              label="Type"
              value={search.purpose}
              options={PURPOSE_OPTIONS}
              onChange={(purpose) => setFilter({ purpose })}
            />
            <DataTableFilter
              label="Status"
              value={search.status}
              options={PAYMENT_STATUS_OPTIONS}
              onChange={(status) => setFilter({ status })}
            />
          </DataTableToolbar>
          <PaymentsTable
            data={paymentsQ.data}
            isLoading={paymentsQ.isPending}
            search={search}
            setSearch={setSearch}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onSelect={setSelected}
          />
        </DataTableCard>
      )}

      <PaymentDetailsSheet
        payment={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </main>
  );
}
