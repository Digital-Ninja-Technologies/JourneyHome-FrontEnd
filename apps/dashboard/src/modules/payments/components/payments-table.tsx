import type { Payment, Plan } from "@journeyhome/schemas";
import { Badge } from "@journeyhome/ui/components/badge";
import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@journeyhome/ui/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@journeyhome/ui/components/select";
import { Skeleton } from "@journeyhome/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@journeyhome/ui/components/table";
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  type Column,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronsUpDown,
  Clock,
  Copy,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { firstName, formatDay, formatMoney } from "@/lib/format";
import { PaymentDetailsSheet } from "./payment-details-sheet";

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Payment>();

const EMPTY_DATA: Payment[] = [];

const PAGE_SIZES = [10, 20, 50] as const;
const ALL = "all";

const STATUS_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "Successful", label: "Successful" },
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Failed", label: "Failed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Refunded", label: "Refunded" },
] as const;

/** Column header that toggles sorting; shows the current direction. */
function SortHeader({
  column,
  children,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: header value type varies per column
  column: Column<typeof features, Payment, any>;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "group -ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 uppercase tracking-wider transition-colors hover:bg-muted hover:text-foreground",
        sorted && "text-foreground",
      )}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="size-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3" />
      ) : (
        <ChevronsUpDown className="size-3 opacity-40 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

export interface PaymentsTableProps {
  payments: Payment[];
  plans: Plan[];
  isLoading?: boolean;
  selectedPlanId?: string;
  onSelectPlanId?: (id?: string) => void;
}

function TableStatusBadge({ status }: { status: Payment["status"] }) {
  switch (status) {
    case "Successful":
      return (
        <Badge
          variant="outline"
          className="border-status-active-bg bg-status-active-bg text-status-active text-[10px] font-semibold gap-1 py-0.5 px-2 uppercase"
        >
          <CheckCircle className="size-2.5" />
          <span>Successful</span>
        </Badge>
      );
    case "Pending":
    case "Processing":
      return (
        <Badge
          variant="outline"
          className="border-status-pending-bg bg-status-pending-bg text-status-pending text-[10px] font-semibold gap-1 py-0.5 px-2 uppercase"
        >
          <Clock className="size-2.5" />
          <span>{status}</span>
        </Badge>
      );
    case "Failed":
      return (
        <Badge
          variant="outline"
          className="border-status-cancelled-bg bg-status-cancelled-bg text-status-cancelled text-[10px] font-semibold gap-1 py-0.5 px-2 uppercase"
        >
          <XCircle className="size-2.5" />
          <span>Failed</span>
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-border bg-muted/40 text-muted-foreground text-[10px] font-semibold gap-1 py-0.5 px-2 uppercase"
        >
          <AlertCircle className="size-2.5" />
          <span>{status}</span>
        </Badge>
      );
  }
}

export function PaymentsTable({
  payments,
  plans,
  isLoading = false,
  selectedPlanId,
  onSelectPlanId,
}: PaymentsTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(
    null,
  );

  const plansById = React.useMemo(
    () => new Map(plans.map((p) => [p._id, p])),
    [plans],
  );

  const planLabel = React.useCallback(
    (id: string | null | undefined) => {
      const plan = id ? plansById.get(id) : undefined;
      if (!plan) return "All plans";
      return `${firstName(plan.coveredPerson.fullName)} (${plan.coveredPerson.relationship})`;
    },
    [plansById],
  );

  // Filtering happens before the table; sorting + pagination are TanStack's job.
  const filteredRows = React.useMemo(() => {
    let list = payments;

    if (selectedPlanId) {
      list = list.filter((p) => p.plan === selectedPlanId);
    }

    if (statusFilter !== ALL) {
      list = list.filter((p) => p.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const plan = plansById.get(p.plan);
        const name = plan?.coveredPerson.fullName?.toLowerCase() || "";
        const ref = p.reference.toLowerCase();
        const pkg = plan?.packageDetails.name?.toLowerCase() || "";
        const amount = String(p.amount);
        return (
          ref.includes(q) ||
          name.includes(q) ||
          pkg.includes(q) ||
          amount.includes(q)
        );
      });
    }

    return list;
  }, [payments, selectedPlanId, statusFilter, search, plansById]);

  const handleCopyReference = React.useCallback(
    (e: React.MouseEvent, ref: string) => {
      e.stopPropagation();
      navigator.clipboard.writeText(ref);
      toast.add({
        title: "Reference copied",
        type: "success",
      });
    },
    [],
  );

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter(ALL);
    onSelectPlanId?.(undefined);
  };

  const hasActiveFilters =
    Boolean(search) || statusFilter !== ALL || Boolean(selectedPlanId);

  // TanStack Table columns definition
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("reference", {
          header: "Reference",
          enableSorting: false,
          cell: (info) => {
            const ref = info.getValue() as string;
            return (
              <div className="flex items-center gap-1.5 py-1">
                <span className="font-mono text-xs font-semibold text-foreground truncate max-w-[120px]">
                  {ref}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyReference(e, ref)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                  title="Copy reference"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            );
          },
        }),

        columnHelper.accessor("plan", {
          header: "Plan",
          enableSorting: false,
          cell: (info) => {
            const planId = info.getValue() as string;
            const plan = plansById.get(planId);
            return (
              <div className="min-w-0 py-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  Journey Home Plan
                </p>
                {plan ? (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {firstName(plan.coveredPerson.fullName)} (
                    {plan.coveredPerson.relationship})
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {planId.slice(0, 8)}...
                  </p>
                )}
              </div>
            );
          },
        }),

        columnHelper.accessor(
          (row) => +new Date(row.processedAt ?? row.createdAt),
          {
            id: "date",
            header: ({ column }) => (
              <SortHeader column={column}>Date</SortHeader>
            ),
            cell: (info) => {
              const dateStr =
                info.row.original.processedAt ?? info.row.original.createdAt;
              return (
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatDay(dateStr)} {new Date(dateStr).getFullYear()}
                </span>
              );
            },
          },
        ),

        columnHelper.accessor("purpose", {
          header: "Type",
          enableSorting: false,
          cell: (info) => {
            const purpose = info.getValue() as string;
            return (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {purpose === "initial_contribution"
                  ? "First contribution"
                  : "Monthly contribution"}
              </span>
            );
          },
        }),

        columnHelper.accessor("amount", {
          header: ({ column }) => (
            <SortHeader column={column}>Amount</SortHeader>
          ),
          cell: (info) => {
            const row = info.row.original;
            return (
              <span className="text-xs font-bold tabular-nums text-foreground">
                {formatMoney(row.amount, row.currency)}
              </span>
            );
          },
        }),

        columnHelper.accessor("status", {
          header: "Status",
          enableSorting: false,
          cell: (info) => {
            const status = info.getValue() as Payment["status"];
            return <TableStatusBadge status={status} />;
          },
        }),

        columnHelper.display({
          id: "actions",
          header: () => <span className="sr-only">Actions</span>,
          cell: (info) => {
            const pay = info.row.original;
            const plan = plansById.get(pay.plan);
            const canResume =
              plan?.status === "Pending" &&
              pay.purpose === "initial_contribution" &&
              pay.status !== "Successful" &&
              pay.status !== "Refunded";
            const resumeLabel =
              pay.status === "Failed" || pay.status === "Cancelled"
                ? "Retry"
                : "Continue";

            return (
              <div className="text-right py-1">
                {canResume && plan ? (
                  <Link
                    to="/app/payments/new"
                    search={{ plan: plan._id }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "h-7 rounded-lg px-2.5 text-[11px] font-semibold text-canvas gap-1 inline-flex items-center",
                    )}
                  >
                    <RotateCcw className="size-3" />
                    <span>{resumeLabel}</span>
                  </Link>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPayment(pay);
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    Details
                  </Button>
                )}
              </div>
            );
          },
        }),
      ]),
    [plansById, handleCopyReference],
  );

  // TanStack Table instance (sorting + pagination are table-managed state)
  const table = useTable({
    features,
    columns,
    data: isLoading ? EMPTY_DATA : filteredRows,
    enableSortingRemoval: false,
    initialState: {
      sorting: [{ id: "date", desc: true }],
      pagination: { pageIndex: 0, pageSize: PAGE_SIZES[0] },
    },
  });

  const { pageIndex, pageSize } = table.state.pagination;
  const totalRows = filteredRows.length;
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = Math.min(pageIndex + 1, pageCount);
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {/* Heading */}
      <div>
        <h2 className="font-serif text-[26px] sm:text-[28px] font-normal leading-tight text-foreground">
          Payment history
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review past contributions, references, and transaction statuses.
        </p>
      </div>

      {/* Table card: toolbar → table → footer */}
      <div className="w-full max-w-full min-w-0 rounded-2xl border border-border/80 bg-white overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-col gap-2.5 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full min-w-0 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              aria-label="Search payments"
              placeholder="Search reference, person, or amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full min-w-0 rounded-lg border-border/70 bg-accent/10 pl-8 pr-7 text-xs"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Plan filter: a dropdown scales to any number of plans */}
            {plans.length > 1 && (
              <Select
                value={selectedPlanId ?? ALL}
                onValueChange={(val) =>
                  onSelectPlanId?.(!val || val === ALL ? undefined : val)
                }
              >
                <SelectTrigger
                  size="xs"
                  aria-label="Filter by plan"
                  className="w-auto min-w-0 max-w-full bg-white sm:max-w-56"
                >
                  <span className="text-muted-foreground">Plan</span>
                  <SelectValue>
                    {(v: string | null) => planLabel(v === ALL ? null : v)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  size="xs"
                  align="end"
                  alignItemWithTrigger={false}
                  className="min-w-52"
                >
                  <SelectItem value={ALL}>All plans</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {planLabel(p._id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) setStatusFilter(val);
              }}
            >
              <SelectTrigger
                size="xs"
                aria-label="Filter by status"
                className="w-auto bg-white"
              >
                <span className="text-muted-foreground">Status</span>
                <SelectValue>
                  {(v: string | null) =>
                    STATUS_OPTIONS.find((o) => o.value === v)?.label ?? "All"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent size="xs" align="end" alignItemWithTrigger={false}>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto">
          <Table className="w-full min-w-[680px]">
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border/60">
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : undefined
                        }
                        className="h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading rows
                  <TableRow key={idx} className="border-border/60">
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-32 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Skeleton className="h-7 w-14 rounded-lg ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedPayment(row.original)}
                    className="border-border/60 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    {row.getAllCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-12 text-center text-xs text-muted-foreground"
                  >
                    <p className="font-semibold text-foreground text-sm mb-1">
                      No payments found
                    </p>
                    <p className="mb-4 text-muted-foreground">
                      {hasActiveFilters
                        ? "No payment records match your active search and filter criteria."
                        : "No payments recorded yet."}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="rounded-lg text-xs h-8 px-3"
                      >
                        Reset filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer: result count (left) · rows per page + pager (right) */}
        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {firstRow}–{lastRow}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {totalRows}
            </span>{" "}
            {totalRows === 1 ? "payment" : "payments"}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 sm:justify-end">
            {totalRows > PAGE_SIZES[0] && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    if (val) table.setPageSize(Number(val));
                  }}
                >
                  <SelectTrigger
                    size="xs"
                    aria-label="Rows per page"
                    className="w-16 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    size="xs"
                    alignItemWithTrigger={false}
                    className="min-w-16"
                  >
                    {PAGE_SIZES.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {pageCount > 1 && (
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    />
                  </PaginationItem>

                  {/* Compact "Page x of y" on small screens */}
                  <PaginationItem className="px-2 text-xs text-muted-foreground tabular-nums sm:hidden">
                    {currentPage} / {pageCount}
                  </PaginationItem>

                  {Array.from({ length: pageCount }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pageCount ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const hasGap = prev !== undefined && p - prev > 1;

                      return (
                        <React.Fragment key={p}>
                          {hasGap && (
                            <PaginationItem className="hidden sm:block">
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem className="hidden sm:block">
                            <PaginationLink
                              isActive={p === currentPage}
                              onClick={() => table.setPageIndex(p - 1)}
                              className={cn(
                                "text-xs",
                                p === currentPage &&
                                  "border-foreground bg-foreground text-primary-foreground hover:bg-foreground/90 hover:text-primary-foreground",
                              )}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* Fully Responsive Payment Details Sheet */}
      <PaymentDetailsSheet
        open={Boolean(selectedPayment)}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
        payment={selectedPayment}
        plan={selectedPayment ? plansById.get(selectedPayment.plan) : undefined}
      />
    </div>
  );
}
