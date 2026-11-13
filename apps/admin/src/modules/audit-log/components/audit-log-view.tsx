import type { AuditLog } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { ComponentErrorState } from "@/components/async-boundary";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTableCard } from "@/components/data-table/data-table";
import {
  DataTableFilter,
  DataTableToolbar,
} from "@/components/data-table/data-table-toolbar";
import { PageHeader } from "@/components/page-header";
import { matchPreset, PERIOD_PRESETS, presetRange } from "@/lib/date";
import type { AuditLogSearch } from "@/lib/search-schemas";
import {
  ACTION_OPTIONS,
  describe,
  exportAuditCsv,
  RESOURCE_TYPE_OPTIONS,
} from "../audit-log.utils";
import { useDeleteAuditLogMutation } from "../mutations";
import { useAuditLogs } from "../query-options";
import { AuditLogTable } from "./audit-log-table";

export function AuditLogView() {
  const search = useSearch({ from: "/_protected/audit-log" });
  const navigate = useNavigate({ from: "/audit-log" });
  const auditQ = useAuditLogs({
    page: search.page,
    limit: search.limit,
    action: search.action,
    resourceType: search.resourceType,
    startDate: search.from,
    endDate: search.to,
  });
  const remove = useDeleteAuditLogMutation();
  const [pendingDelete, setPendingDelete] = useState<AuditLog | null>(null);
  const onDelete = useCallback((e: AuditLog) => setPendingDelete(e), []);

  const setSearch = (patch: Partial<AuditLogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const setFilter = (patch: Partial<AuditLogSearch>) =>
    setSearch({ ...patch, page: undefined });

  const preset = matchPreset(search.from, search.to);
  const hasActiveFilters = Boolean(
    search.action || search.resourceType || search.from || search.to,
  );
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  const rows = auditQ.data?.items ?? [];

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        description="Who did what, and when."
        actions={
          <Button
            variant="outline"
            size="lg"
            disabled={rows.length === 0}
            onClick={() => exportAuditCsv(rows)}
          >
            <Download />
            Export page
          </Button>
        }
      />

      {auditQ.isError && !auditQ.data ? (
        <ComponentErrorState
          title="Couldn't load the audit log"
          error={auditQ.error}
          onRetry={() => void auditQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          >
            <DataTableFilter
              label="Period"
              allLabel={search.from || search.to ? "Custom" : "All time"}
              value={preset}
              options={PERIOD_PRESETS}
              onChange={(p) =>
                setFilter(
                  p ? presetRange(p) : { from: undefined, to: undefined },
                )
              }
            />
            <DataTableFilter
              label="Resource"
              value={search.resourceType}
              options={RESOURCE_TYPE_OPTIONS}
              onChange={(resourceType) => setFilter({ resourceType })}
            />
            <DataTableFilter
              label="Action"
              value={search.action}
              options={ACTION_OPTIONS}
              onChange={(action) => setFilter({ action })}
            />
          </DataTableToolbar>
          <AuditLogTable
            data={auditQ.data}
            isLoading={auditQ.isPending}
            search={search}
            setSearch={setSearch}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onDelete={onDelete}
          />
        </DataTableCard>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this audit entry?"
        description={
          pendingDelete
            ? `“${describe(pendingDelete)}” will be permanently removed from the audit log.`
            : undefined
        }
        confirmLabel="Delete entry"
        destructive
        isPending={remove.isPending}
        onConfirm={() =>
          pendingDelete &&
          remove.mutate(pendingDelete._id, {
            onSettled: () => setPendingDelete(null),
          })
        }
      />
    </main>
  );
}
