import type {
  AdminPayment,
  PaginatedAdminPayments,
} from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  type ServerTableFeatures,
  type SetTableSearch,
  useServerTable,
} from "@/components/data-table/use-server-table";
import { PaymentStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney } from "@/lib/format";
import type { TableSearch } from "@/lib/search-schemas";
import { PURPOSE_LABEL, planLabel } from "../payments.utils";

const columnHelper = createColumnHelper<ServerTableFeatures, AdminPayment>();

function copyReference(e: React.MouseEvent, ref: string) {
  e.stopPropagation();
  void navigator.clipboard.writeText(ref);
  toast.add({ title: "Reference copied", type: "success" });
}

const columns = columnHelper.columns([
  columnHelper.accessor("reference", {
    header: "Reference",
    cell: (info) => {
      const ref = info.getValue();
      return (
        <div className="flex items-center gap-1.5 py-1">
          <span className="max-w-[130px] truncate font-mono text-xs font-semibold">
            {ref}
          </span>
          <button
            type="button"
            onClick={(e) => copyReference(e, ref)}
            className="cursor-pointer p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Copy reference"
            title="Copy reference"
          >
            <Copy className="size-3" />
          </button>
        </div>
      );
    },
  }),
  columnHelper.accessor("owner", {
    header: "Customer",
    cell: (info) => {
      const owner = info.getValue();
      return (
        <Link
          to="/users/$id"
          params={{ id: owner._id }}
          onClick={(e) => e.stopPropagation()}
          className="block min-w-0 py-1 hover:underline"
        >
          <span className="block truncate text-xs font-semibold">
            {owner.name}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {owner.email}
          </span>
        </Link>
      );
    },
  }),
  columnHelper.accessor("plan", {
    header: "Plan",
    cell: (info) => {
      const row = info.row.original;
      return (
        <Link
          to="/plans/$id"
          params={{ id: row.plan._id }}
          onClick={(e) => e.stopPropagation()}
          className="block min-w-0 py-1 hover:underline"
        >
          <span className="block truncate text-xs font-semibold">
            {planLabel(row)}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {row.plan.packageDetails?.name ?? "—"}
          </span>
        </Link>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("purpose", {
    header: "Type",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {PURPOSE_LABEL[info.getValue()] ?? info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => (
      <span className="text-xs font-bold tabular-nums">
        {formatMoney(info.getValue(), info.row.original.currency)}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <PaymentStatusPill status={info.getValue()} />,
  }),
]);

export function PaymentsTable({
  data,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
  onSelect,
}: {
  data: PaginatedAdminPayments | undefined;
  isLoading: boolean;
  search: TableSearch;
  setSearch: SetTableSearch;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onSelect: (payment: AdminPayment) => void;
}) {
  const { table, paginationProps } = useServerTable({
    columns,
    data: data?.items,
    meta: data?.pagination,
    search,
    setSearch,
    getRowId: (row) => row._id,
  });

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        minWidth={860}
        onRowClick={onSelect}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No payments found",
          description: "No transactions recorded yet.",
          filteredDescription: "No transactions match your search and filters.",
        }}
      />
      <DataTablePagination
        {...paginationProps}
        noun={["payment", "payments"]}
      />
    </>
  );
}
