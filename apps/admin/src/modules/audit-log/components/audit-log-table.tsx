import type { AuditLog, PaginatedAuditLogs } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  type ServerTableFeatures,
  type SetTableSearch,
  useServerTable,
} from "@/components/data-table/use-server-table";
import { formatDateTime } from "@/lib/format";
import type { TableSearch } from "@/lib/search-schemas";
import {
  actionLabel,
  actorName,
  describe,
  reasonOf,
  resourceLink,
} from "../audit-log.utils";

const columnHelper = createColumnHelper<ServerTableFeatures, AuditLog>();

function buildColumns(onDelete: (entry: AuditLog) => void) {
  return columnHelper.columns([
    columnHelper.accessor("createdAt", {
      header: "Time",
      cell: (info) => (
        <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
          {formatDateTime(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actor",
      header: "Actor",
      cell: (info) => {
        const e = info.row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{actorName(e)}</p>
            {e.actor?.email && (
              <p className="truncate text-[11px] text-muted-foreground">
                {e.actor.email}
              </p>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("action", {
      header: "Action",
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
        const reason = reasonOf(e);
        const text = (
          <span className="text-xs text-ink-soft">{describe(e)}</span>
        );
        return (
          <div className="min-w-0">
            {link ? (
              <Link
                to={link.to}
                params={{ id: link.id }}
                className="hover:underline"
              >
                {text}
              </Link>
            ) : (
              text
            )}
            {reason && (
              <p className="line-clamp-1 text-[11px] italic text-muted-foreground">
                “{reason}”
              </p>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "delete",
      header: () => <span className="sr-only">Delete</span>,
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete audit entry"
          className="text-muted-foreground hover:text-status-cancelled"
          onClick={() => onDelete(info.row.original)}
        >
          <Trash2 />
        </Button>
      ),
    }),
  ]);
}

export function AuditLogTable({
  data,
  isLoading,
  search,
  setSearch,
  hasActiveFilters,
  onResetFilters,
  onDelete,
}: {
  data: PaginatedAuditLogs | undefined;
  isLoading: boolean;
  search: TableSearch;
  setSearch: SetTableSearch;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onDelete: (entry: AuditLog) => void;
}) {
  const columns = useMemo(() => buildColumns(onDelete), [onDelete]);
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
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        empty={{
          title: "No activity",
          description: "Nothing has been recorded yet.",
          filteredDescription: "No events match your filters.",
        }}
      />
      <DataTablePagination {...paginationProps} noun={["event", "events"]} />
    </>
  );
}
