import type {
  AdminUserListItem,
  PaginatedAdminUsers,
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
import { UserStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney, initials } from "@/lib/format";
import type { TableSearch } from "@/lib/search-schemas";

const columnHelper = createColumnHelper<
  ServerTableFeatures,
  AdminUserListItem
>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Customer",
    cell: (info) => {
      const u = info.row.original;
      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sand text-[11px] font-bold">
            {initials(u.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{u.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {u.email}
            </p>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor("planCount", {
    header: "Plans",
    cell: (info) => (
      <span className="text-xs tabular-nums">
        {info.getValue()}
        {info.row.original.activePlanCount > 0 && (
          <span className="text-muted-foreground">
            {" "}
            · {info.row.original.activePlanCount} active
          </span>
        )}
      </span>
    ),
  }),
  columnHelper.accessor("totalSaved", {
    header: "Total saved",
    cell: (info) => (
      <span className="text-xs font-bold tabular-nums">
        {formatMoney(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <UserStatusPill status={info.getValue()} />,
  }),
  columnHelper.accessor("createdAt", {
    header: "Joined",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDate(info.getValue())}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: (info) => (
      <div className="text-right">
        <Link
          to="/users/$id"
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

export function UsersTable({
  data,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
}: {
  data: PaginatedAdminUsers | undefined;
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
        onRowClick={(u) =>
          navigate({ to: "/users/$id", params: { id: u._id } })
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No users found",
          description: "No customers have signed up yet.",
          filteredDescription: "No customers match your search.",
        }}
      />
      <DataTablePagination {...paginationProps} noun={["user", "users"]} />
    </>
  );
}
