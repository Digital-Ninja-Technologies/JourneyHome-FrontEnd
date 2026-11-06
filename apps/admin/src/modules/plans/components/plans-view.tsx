import { useNavigate, useSearch } from "@tanstack/react-router";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import {
  DataTableFilter,
  DataTableToolbar,
} from "@/components/data-table/data-table-toolbar";
import { PageHeader } from "@/components/page-header";
import type { PlansSearch } from "@/lib/search-schemas";
import { PLAN_STATUS_OPTIONS } from "../plans.utils";
import { usePlans } from "../query-options";
import { PlansTable } from "./plans-table";

export function PlansView() {
  const search = useSearch({ from: "/_protected/plans/" });
  const navigate = useNavigate({ from: "/plans/" });
  const plansQ = usePlans(search);

  const setSearch = (patch: Partial<PlansSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  /** Filter changes always go back to page 1. */
  const setFilter = (patch: Partial<PlansSearch>) =>
    setSearch({ ...patch, page: undefined });

  const hasActiveFilters = Boolean(search.search || search.status);
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Plans"
        description="Every coverage plan across all customers."
      />

      {plansQ.isError && !plansQ.data ? (
        <ComponentErrorState
          title="Couldn't load plans"
          error={plansQ.error}
          onRetry={() => void plansQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            search={search.search}
            onSearchChange={(value) => setFilter({ search: value })}
            searchPlaceholder="Search owner or covered person"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          >
            <DataTableFilter
              label="Status"
              value={search.status}
              options={PLAN_STATUS_OPTIONS}
              onChange={(status) => setFilter({ status })}
            />
          </DataTableToolbar>
          <PlansTable
            data={plansQ.data}
            isLoading={plansQ.isPending}
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
