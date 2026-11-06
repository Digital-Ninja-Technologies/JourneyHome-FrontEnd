import { useNavigate, useSearch } from "@tanstack/react-router";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import {
  DataTableFilter,
  DataTableToolbar,
} from "@/components/data-table/data-table-toolbar";
import { PageHeader } from "@/components/page-header";
import type { ServiceRequestsSearch } from "@/lib/search-schemas";
import { useServiceRequests } from "../query-options";
import { REQUEST_STATUS_OPTIONS } from "../service-requests.utils";
import { ServiceRequestsTable } from "./service-requests-table";

export function ServiceRequestsView() {
  const search = useSearch({ from: "/_protected/service-requests/" });
  const navigate = useNavigate({ from: "/service-requests/" });
  const requestsQ = useServiceRequests(search);

  const setSearch = (patch: Partial<ServiceRequestsSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const setFilter = (patch: Partial<ServiceRequestsSearch>) =>
    setSearch({ ...patch, page: undefined });

  const hasActiveFilters = Boolean(search.search || search.status);
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Service"
        accent="requests"
        description="Review documents, decide requests, and book photographers."
      />

      {requestsQ.isError && !requestsQ.data ? (
        <ComponentErrorState
          title="Couldn't load service requests"
          error={requestsQ.error}
          onRetry={() => void requestsQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            search={search.search}
            onSearchChange={(value) => setFilter({ search: value })}
            searchPlaceholder="Search covered person, owner, or contact"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          >
            <DataTableFilter
              label="Status"
              value={search.status}
              options={REQUEST_STATUS_OPTIONS}
              onChange={(status) => setFilter({ status })}
            />
          </DataTableToolbar>
          <ServiceRequestsTable
            data={requestsQ.data}
            isLoading={requestsQ.isPending}
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
