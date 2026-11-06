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
import { cn } from "@journeyhome/ui/lib/utils";
import * as React from "react";
import { PAGE_SIZES } from "@/lib/search-schemas";

export interface DataTablePaginationProps {
  /** Zero-based. */
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Noun for the count, e.g. "payment" → "payments". */
  noun?: [singular: string, plural: string];
  pageSizes?: readonly number[];
}

/** Footer: result count (left) · rows per page + pager (right). */
export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount: rawPageCount,
  totalRows,
  onPageChange,
  onPageSizeChange,
  noun = ["record", "records"],
  pageSizes = PAGE_SIZES,
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, rawPageCount);
  const currentPage = Math.min(pageIndex + 1, pageCount);
  const firstRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, totalRows);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {firstRow}–{lastRow}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {totalRows.toLocaleString()}
        </span>{" "}
        {totalRows === 1 ? noun[0] : noun[1]}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 sm:justify-end">
        {totalRows > pageSizes[0] && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                if (val) onPageSizeChange(Number(val));
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
                {pageSizes.map((n) => (
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
                  onClick={() => onPageChange(currentPage - 2)}
                  disabled={currentPage <= 1}
                />
              </PaginationItem>

              {/* Compact "x / y" on small screens */}
              <PaginationItem className="px-2 text-xs tabular-nums text-muted-foreground sm:hidden">
                {currentPage} / {pageCount}
              </PaginationItem>

              {pages.map((p, idx) => {
                const prev = pages[idx - 1];
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
                        onClick={() => onPageChange(p - 1)}
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
                  onClick={() => onPageChange(currentPage)}
                  disabled={currentPage >= pageCount}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
