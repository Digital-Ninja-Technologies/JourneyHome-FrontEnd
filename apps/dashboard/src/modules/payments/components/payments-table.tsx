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
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
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
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Payment>();

const EMPTY_DATA: Payment[] = [];

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
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(1);
  const [sortOrder, setSortOrder] = React.useState<"desc" | "asc">("desc");
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(
    null,
  );

  const plansById = React.useMemo(
    () => new Map(plans.map((p) => [p._id, p])),
    [plans],
  );

  // Filter & sort data
  const filteredRows = React.useMemo(() => {
    let list = [...payments];

    // Filter by Plan
    if (selectedPlanId) {
      list = list.filter((p) => p.plan === selectedPlanId);
    }

    // Filter by Status
    if (statusFilter && statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Filter by Search Query
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

    // Sort by Date
    list.sort((a, b) => {
      const dateA = +new Date(a.processedAt ?? a.createdAt);
      const dateB = +new Date(b.processedAt ?? b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [payments, selectedPlanId, statusFilter, search, sortOrder, plansById]);

  // Reset page when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when filter criteria change
  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, selectedPlanId, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRows.length);
  const pageRows = React.useMemo(
    () => filteredRows.slice(startIndex, endIndex),
    [filteredRows, startIndex, endIndex],
  );

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
    setStatusFilter("all");
    onSelectPlanId?.(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) || statusFilter !== "all" || Boolean(selectedPlanId);

  // TanStack Table columns definition
  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("reference", {
          header: "Reference",
          cell: (info) => {
            const ref = info.getValue() as string;
            return (
              <div className="flex items-center gap-1.5 py-1">
                <span className="font-mono text-xs font-semibold text-foreground truncate max-w-[130px] sm:max-w-none">
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

        columnHelper.accessor((row) => row.processedAt ?? row.createdAt, {
          id: "date",
          header: "Date",
          cell: (info) => {
            const dateStr = info.getValue() as string;
            return (
              <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {formatDay(dateStr)} {new Date(dateStr).getFullYear()}
              </span>
            );
          },
        }),

        columnHelper.accessor("purpose", {
          header: "Type",
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
          header: "Amount",
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

  const tableData = isLoading ? EMPTY_DATA : pageRows;

  // TanStack Table instance
  const table = useTable({
    features,
    columns,
    data: tableData,
  });

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {/* Top Header: Title & Plan Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-[26px] sm:text-[28px] font-normal leading-tight text-foreground">
            Payment history
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review past contributions, references, and transaction statuses.
          </p>
        </div>

        {/* Plan Filter Pills */}
        {plans.length > 1 && (
          <nav
            className="flex flex-wrap items-center gap-1.5 rounded-full p-1 bg-muted/40"
            aria-label="Filter by plan"
          >
            {[
              { id: null, label: "All plans" },
              ...plans.map((p) => ({
                id: p._id,
                label: `${firstName(p.coveredPerson.fullName)}'s plan`,
              })),
            ].map((f) => (
              <button
                key={f.id ?? "all"}
                type="button"
                aria-pressed={(selectedPlanId || null) === f.id}
                onClick={() => onSelectPlanId?.(f.id ?? undefined)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                  (selectedPlanId || null) === f.id
                    ? "bg-foreground text-canvas shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                )}
              >
                {f.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Search & Filter Toolbar (Compact h-8 controls, Select dropdown for status, no refresh button) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-muted/30 p-2.5 rounded-xl border border-border/70">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search reference, person, or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs rounded-lg bg-background border-border/70 focus:bg-background focus:border-border transition-all w-full min-w-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Filter Controls: Status Select & Sort Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Select Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium shrink-0">
              Status:
            </span>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) setStatusFilter(val);
              }}
            >
              <SelectTrigger className="h-8 w-32 text-xs rounded-lg bg-background border-border/80">
                <SelectValue placeholder="All Status">
                  {statusFilter === "all" ? "All" : statusFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All
                </SelectItem>
                <SelectItem value="Successful" className="text-xs">
                  Successful
                </SelectItem>
                <SelectItem value="Pending" className="text-xs">
                  Pending
                </SelectItem>
                <SelectItem value="Processing" className="text-xs">
                  Processing
                </SelectItem>
                <SelectItem value="Failed" className="text-xs">
                  Failed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age / Date Sorter Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="h-8 px-2.5 rounded-lg text-xs gap-1.5 bg-background border-border/80 hover:bg-muted/40 shrink-0 font-medium"
            title={`Sort date ${sortOrder === "desc" ? "oldest first" : "newest first"}`}
          >
            <ArrowUpDown className="size-3 text-muted-foreground" />
            <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </Button>

          {/* Reset Active Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground shrink-0 font-medium"
              title="Reset all filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* TanStack Table Container */}
      <div className="w-full max-w-full min-w-0 rounded-2xl border border-border/80 bg-white overflow-hidden shadow-xs">
        <div className="w-full max-w-full min-w-0 overflow-x-auto">
          <Table className="w-full min-w-[680px]">
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border/60">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
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

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/60 bg-muted/10 w-full">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length > 0 ? startIndex + 1 : 0}
              </span>
              {" – "}
              <span className="font-semibold text-foreground">{endIndex}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
              payments
            </span>

            {/* Per Page Selector with reduced h-8 height */}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px]">Per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  if (val) setPageSize(Number(val));
                }}
              >
                <SelectTrigger className="h-8 w-[68px] text-xs rounded-lg bg-background border-border/80">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" className="text-xs">
                    10
                  </SelectItem>
                  <SelectItem value="20" className="text-xs">
                    20
                  </SelectItem>
                  <SelectItem value="50" className="text-xs">
                    50
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {hasGap && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            isActive={p === currentPage}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
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
