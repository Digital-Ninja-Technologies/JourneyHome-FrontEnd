import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { SortHeader } from "@/components/data-table/sort-header";
import { formatDateTime } from "@/lib/format";
import { type AuditLogSearch, DEFAULT_PAGE_SIZE } from "@/lib/search-schemas";
import type { AuditEntry } from "../api";
import {
  actionLabel,
  actorName,
  describe,
  resourceLink,
} from "../audit-log.utils";

// The endpoint returns everything at once, so sort + paginate in the browser.
const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, AuditEntry>();

const columns = columnHelper.columns([
  columnHelper.accessor((row) => +new Date(row.createdAt), {
    id: "time",
    header: ({ column }) => <SortHeader column={column}>Time</SortHeader>,
    cell: (info) => (
      <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {formatDateTime(info.row.original.createdAt)}
      </span>
    ),
  }),
  columnHelper.accessor((row) => actorName(row), {
    id: "actor",
    header: ({ column }) => <SortHeader column={column}>Actor</SortHeader>,
    cell: (info) => (
      <span className="text-xs font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("action", {
    header: "Action",
    enableSorting: false,
    cell: (info) => (
      <span className="whitespace-nowrap rounded-full bg-muted/50 px-2.5 py-0.5 text-[11px] font-semibold">
        {actionLabel(info.getValue())}
      </span>
    ),
  }),
  columnHelper.display({
    id: "event",
    header: "Event",
    cell: (info) => {
      const e = info.row.original;
      const link = resourceLink(e);
      const text = <span className="text-xs text-ink-soft">{describe(e)}</span>;
      return link ? (
        <Link to={link.to} params={{ id: link.id }} className="hover:underline">
          {text}
        </Link>
      ) : (
        text
      );
    },
  }),
]);

export function AuditLogTable({
  rows,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
}: {
  rows: AuditEntry[];
  isLoading: boolean;
  search: AuditLogSearch;
  setSearch: (patch: Partial<AuditLogSearch>) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}) {
  const pagination = {
    pageIndex: (search.page ?? 1) - 1,
    pageSize: search.limit ?? DEFAULT_PAGE_SIZE,
  };

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row._id,
    enableSortingRemoval: false,
    initialState: { sorting: [{ id: "time", desc: true }] },
    state: { pagination },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      const page =
        next.pageSize !== pagination.pageSize ? 1 : next.pageIndex + 1;
      setSearch({
        page: page === 1 ? undefined : page,
        limit: next.pageSize === DEFAULT_PAGE_SIZE ? undefined : next.pageSize,
      });
    },
    // Filtering changes the row count; keep the URL page instead of auto-resetting.
    autoResetPageIndex: false,
  });

  return (
    <>
      <DataTable
        table={table}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No activity",
          description: "Nothing has been recorded yet.",
          filteredDescription: "No events match your search and filters.",
        }}
      />
      <DataTablePagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={table.getPageCount()}
        totalRows={rows.length}
        onPageChange={(i) => table.setPageIndex(i)}
        onPageSizeChange={(n) => table.setPageSize(n)}
        noun={["event", "events"]}
      />
    </>
  );
}
