import type { PaginationMeta } from "@journeyhome/schemas";
import {
  type OnChangeFn,
  type PaginationState,
  type RowData,
  rowPaginationFeature,
  type TableOptions,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { DEFAULT_PAGE_SIZE, type TableSearch } from "@/lib/search-schemas";

/** Features for tables whose rows are paged by the server. */
export const serverTableFeatures = tableFeatures({ rowPaginationFeature });
export type ServerTableFeatures = typeof serverTableFeatures;

/** Patch for the route's search params; `undefined` removes a key. */
export type SetTableSearch = (patch: Partial<TableSearch>) => void;

/**
 * Maps the URL's `page` / `limit` to TanStack pagination state and back.
 * Defaults are left out of the URL so links stay short.
 */
export function useUrlPagination(
  search: TableSearch,
  setSearch: SetTableSearch,
) {
  const pagination: PaginationState = {
    pageIndex: (search.page ?? 1) - 1,
    pageSize: search.limit ?? DEFAULT_PAGE_SIZE,
  };

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    const sizeChanged = next.pageSize !== pagination.pageSize;
    const page = sizeChanged ? 1 : next.pageIndex + 1;
    setSearch({
      page: page === 1 ? undefined : page,
      limit: next.pageSize === DEFAULT_PAGE_SIZE ? undefined : next.pageSize,
    });
  };

  return { pagination, onPaginationChange };
}

/**
 * A TanStack table over one server page. Pagination lives in the URL, and
 * `meta.total` from the API drives the page count.
 */
export function useServerTable<TData extends RowData>({
  columns,
  data,
  meta,
  search,
  setSearch,
  getRowId,
}: {
  columns: NoInfer<TableOptions<ServerTableFeatures, TData>["columns"]>;
  data: TData[] | undefined;
  meta: PaginationMeta | undefined;
  search: TableSearch;
  setSearch: SetTableSearch;
  getRowId?: (row: TData) => string;
}) {
  const { pagination, onPaginationChange } = useUrlPagination(
    search,
    setSearch,
  );

  const table = useTable({
    features: serverTableFeatures,
    columns,
    data: data ?? (EMPTY as TData[]),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    manualPagination: true,
    rowCount: meta?.total ?? 0,
    state: { pagination },
    onPaginationChange,
  });

  /** Props for `<DataTablePagination>`. */
  const paginationProps = {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    pageCount: meta?.totalPages ?? 1,
    totalRows: meta?.total ?? 0,
    onPageChange: (pageIndex: number) => table.setPageIndex(pageIndex),
    onPageSizeChange: (pageSize: number) => table.setPageSize(pageSize),
  };

  return { table, paginationProps };
}

/** Stable empty rows so the table doesn't re-process on every render. */
const EMPTY: never[] = [];
