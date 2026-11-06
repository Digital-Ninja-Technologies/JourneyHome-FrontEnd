import { Button } from "@journeyhome/ui/components/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo } from "react";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import {
  DataTableFilter,
  DataTableToolbar,
} from "@/components/data-table/data-table-toolbar";
import { DemoNotice } from "@/components/demo-notice";
import { PageHeader } from "@/components/page-header";
import { UnsupportedState } from "@/components/unsupported-state";
import { isUnsupported } from "@/lib/api";
import type { AuditLogSearch } from "@/lib/search-schemas";
import type { AuditEntry } from "../api";
import {
  actionLabel,
  actorName,
  describe,
  exportAuditCsv,
} from "../audit-log.utils";
import { useAuditLog } from "../query-options";
import { AuditLogTable } from "./audit-log-table";

const EMPTY: AuditEntry[] = [];

export function AuditLogView() {
  const search = useSearch({ from: "/_protected/audit-log" });
  const navigate = useNavigate({ from: "/audit-log" });
  const auditQ = useAuditLog();

  const setSearch = (patch: Partial<AuditLogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const setFilter = (patch: Partial<AuditLogSearch>) =>
    setSearch({ ...patch, page: undefined });

  const all = auditQ.data ?? EMPTY;
  const actors = useMemo(
    () =>
      [...new Set(all.map(actorName))]
        .sort()
        .map((a) => ({ value: a, label: a })),
    [all],
  );
  const actions = useMemo(
    () =>
      [...new Set(all.map((e) => e.action))]
        .sort()
        .map((a) => ({ value: a, label: actionLabel(a) })),
    [all],
  );

  const needle = search.search?.toLowerCase();
  const rows = useMemo(
    () =>
      all.filter(
        (e) =>
          (!search.actor || actorName(e) === search.actor) &&
          (!search.action || e.action === search.action) &&
          (!needle || describe(e).toLowerCase().includes(needle)),
      ),
    [all, search.actor, search.action, needle],
  );

  const hasActiveFilters = Boolean(
    search.search || search.actor || search.action,
  );
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  if (auditQ.isError && isUnsupported(auditQ.error)) {
    return (
      <main className="flex max-w-[720px] flex-col gap-6">
        <PageHeader title="Audit log" />
        <UnsupportedState endpoint="GET /audit-logs">
          Admin actions are recorded, but there's no route to read them yet.
        </UnsupportedState>
      </main>
    );
  }

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
            Export CSV
          </Button>
        }
      />
      <DemoNotice />

      {auditQ.isError ? (
        <ComponentErrorState
          title="Couldn't load the audit log"
          error={auditQ.error}
          onRetry={() => void auditQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            search={search.search}
            onSearchChange={(value) => setFilter({ search: value })}
            searchPlaceholder="Search events"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          >
            <DataTableFilter
              label="Actor"
              value={search.actor}
              options={actors}
              onChange={(actor) => setFilter({ actor })}
            />
            <DataTableFilter
              label="Action"
              value={search.action}
              options={actions}
              onChange={(action) => setFilter({ action })}
            />
          </DataTableToolbar>
          <AuditLogTable
            rows={rows}
            isLoading={auditQ.isPending}
            search={search}
            setSearch={setSearch}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        </DataTableCard>
      )}
    </main>
  );
}
