import type {
  ContactRecord,
  PaginatedContactSubmissions,
} from "@journeyhome/schemas";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  type ServerTableFeatures,
  type SetTableSearch,
  useServerTable,
} from "@/components/data-table/use-server-table";
import { formatDateTime } from "@/lib/format";
import type { TableSearch } from "@/lib/search-schemas";

const columnHelper = createColumnHelper<ServerTableFeatures, ContactRecord>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "From",
    cell: (info) => (
      <div className="min-w-0 py-1">
        <p className="truncate text-xs font-semibold">{info.getValue()}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {info.row.original.email}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("topic", {
    header: "Topic",
    cell: (info) => (
      <span className="whitespace-nowrap rounded-full bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => (
      <span className="line-clamp-1 max-w-[360px] text-xs text-ink-soft">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Received",
    cell: (info) => (
      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDateTime(info.getValue())}
      </span>
    ),
  }),
]);

export function ContactTable({
  data,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
  onSelect,
}: {
  data: PaginatedContactSubmissions | undefined;
  isLoading: boolean;
  search: TableSearch;
  setSearch: SetTableSearch;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onSelect: (message: ContactRecord) => void;
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
        onRowClick={onSelect}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No messages",
          description: "Nobody has used the contact form yet.",
          filteredDescription: "No messages match your search.",
        }}
      />
      <DataTablePagination
        {...paginationProps}
        noun={["message", "messages"]}
      />
    </>
  );
}
