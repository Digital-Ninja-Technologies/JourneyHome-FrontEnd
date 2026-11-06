import { Button } from "@journeyhome/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@journeyhome/ui/components/empty";
import { Skeleton } from "@journeyhome/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@journeyhome/ui/components/table";
import { cn } from "@journeyhome/ui/lib/utils";
import type { ReactTable, RowData, TableFeatures } from "@tanstack/react-table";

export interface DataTableEmpty {
  title?: string;
  /** Shown when nothing exists yet. */
  description?: string;
  /** Shown when filters hide every row. */
  filteredDescription?: string;
}

export interface DataTableProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  // biome-ignore lint/suspicious/noExplicitAny: any selected-state shape
  table: ReactTable<TFeatures, TData, any>;
  isLoading?: boolean;
  /** Rows shown while loading. Defaults to the page size. */
  skeletonRows?: number;
  onRowClick?: (row: TData) => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  empty?: DataTableEmpty;
  /** Horizontal scroll kicks in below this width. */
  minWidth?: number;
  className?: string;
}

type SortableColumn = { getIsSorted?: () => false | "asc" | "desc" };

/**
 * Table body for a TanStack table: header row, skeleton rows while loading,
 * an empty state, and clickable rows. Toolbar and pagination sit around it.
 */
export function DataTable<
  TFeatures extends TableFeatures,
  TData extends RowData,
>({
  table,
  isLoading = false,
  skeletonRows = 8,
  onRowClick,
  hasActiveFilters = false,
  onResetFilters,
  empty,
  minWidth = 720,
  className,
}: DataTableProps<TFeatures, TData>) {
  const columnCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto">
      <Table className={cn("w-full", className)} style={{ minWidth }}>
        <TableHeader className="bg-muted/30">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border/60">
              {headerGroup.headers.map((header) => {
                const sorted = (
                  header.column as unknown as SortableColumn
                ).getIsSorted?.();
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
            Array.from({ length: skeletonRows }).map((_, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
              <TableRow key={r} className="border-border/60">
                {Array.from({ length: columnCount }).map((_, c) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells
                  <TableCell key={c} className="py-3">
                    <Skeleton
                      className={cn(
                        "h-4 rounded-md",
                        c === 0
                          ? "w-28"
                          : c === columnCount - 1
                            ? "ml-auto w-12"
                            : "w-20",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={cn(
                  "border-border/60 transition-colors hover:bg-muted/30",
                  onRowClick && "cursor-pointer",
                )}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2.5">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="p-0">
                <Empty className="py-12">
                  <EmptyHeader>
                    <EmptyTitle className="text-sm font-semibold">
                      {empty?.title ?? "Nothing to show"}
                    </EmptyTitle>
                    <EmptyDescription className="text-xs">
                      {hasActiveFilters
                        ? (empty?.filteredDescription ??
                          "No records match your search and filters.")
                        : (empty?.description ?? "No records yet.")}
                    </EmptyDescription>
                  </EmptyHeader>
                  {hasActiveFilters && onResetFilters && (
                    <EmptyContent>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-8 rounded-lg px-3 text-xs"
                      >
                        Reset filters
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/** The bordered card that holds toolbar → table → pagination. */
export function DataTableCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs",
        className,
      )}
      {...props}
    />
  );
}
