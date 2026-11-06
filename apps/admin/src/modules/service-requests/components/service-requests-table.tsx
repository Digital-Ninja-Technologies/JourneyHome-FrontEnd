import type {
  AdminServiceRequest,
  PaginatedAdminServiceRequests,
} from "@journeyhome/schemas";
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
import { RequestStatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import type { TableSearch } from "@/lib/search-schemas";

const columnHelper = createColumnHelper<
  ServerTableFeatures,
  AdminServiceRequest
>();

const columns = columnHelper.columns([
  columnHelper.accessor("coveredPersonSnapshot", {
    header: "Covered person",
    cell: (info) => (
      <div className="min-w-0 py-1">
        <p className="truncate text-xs font-semibold">
          {info.getValue().fullName}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {info.row.original.plan.packageDetails?.name ?? "—"}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("owner", {
    header: "Requested by",
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
  columnHelper.accessor("expectedServiceDate", {
    header: "Service date",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("serviceLocation", {
    header: "Venue",
    cell: (info) => (
      <span className="block max-w-[200px] truncate text-xs text-muted-foreground">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Submitted",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <RequestStatusPill status={info.getValue()} />,
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => (
      <div className="text-right">
        <Link
          to="/service-requests/$id"
          params={{ id: info.row.original._id }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Review
        </Link>
      </div>
    ),
  }),
]);

export function ServiceRequestsTable({
  data,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
}: {
  data: PaginatedAdminServiceRequests | undefined;
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
        minWidth={820}
        onRowClick={(r) =>
          navigate({ to: "/service-requests/$id", params: { id: r._id } })
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No service requests",
          description: "Nothing has been requested yet.",
          filteredDescription: "No requests match your search and filters.",
        }}
      />
      <DataTablePagination
        {...paginationProps}
        noun={["request", "requests"]}
      />
    </>
  );
}
