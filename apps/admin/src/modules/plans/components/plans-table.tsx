import type { AdminPlan, PaginatedAdminPlans } from "@journeyhome/schemas";
import { buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  type ServerTableFeatures,
  type SetTableSearch,
  useServerTable,
} from "@/components/data-table/use-server-table";
import { PlanStatusPill } from "@/components/status-pill";
import { capitalise, formatMoney } from "@/lib/format";
import type { TableSearch } from "@/lib/search-schemas";

const columnHelper = createColumnHelper<ServerTableFeatures, AdminPlan>();

const columns = columnHelper.columns([
  columnHelper.accessor("coveredPerson", {
    header: "Covered person",
    cell: (info) => {
      const person = info.getValue();
      return (
        <div className="min-w-0 py-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {person.fullName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {capitalise(person.relationship)}
          </p>
        </div>
      );
    },
  }),
  columnHelper.accessor("owner", {
    header: "Owner",
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
  columnHelper.accessor((row) => row.packageDetails.name, {
    id: "package",
    header: "Package",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Monthly",
    cell: (info) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatMoney(info.getValue(), info.row.original.currency)}
      </span>
    ),
  }),
  columnHelper.accessor("totalContributedAmount", {
    header: "Balance",
    cell: (info) => (
      <span className="text-xs font-bold tabular-nums">
        {formatMoney(info.getValue(), info.row.original.currency)}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <PlanStatusPill status={info.getValue()} />,
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => (
      <div className="text-right">
        <Link
          to="/plans/$id"
          params={{ id: info.row.original._id }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          View
        </Link>
      </div>
    ),
  }),
]);

export function PlansTable({
  data,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
}: {
  data: PaginatedAdminPlans | undefined;
  isLoading: boolean;
  search: TableSearch;
  setSearch: SetTableSearch;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}) {
  const navigate = useNavigate();
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
        skeletonRows={Math.min(paginationProps.pageSize, 10)}
        onRowClick={(plan) =>
          navigate({ to: "/plans/$id", params: { id: plan._id } })
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No plans found",
          description: "No customer has started a plan yet.",
          filteredDescription: "No plans match your search and filters.",
        }}
      />
      <DataTablePagination {...paginationProps} noun={["plan", "plans"]} />
    </>
  );
}
