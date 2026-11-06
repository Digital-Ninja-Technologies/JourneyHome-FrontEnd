import { useNavigate, useSearch } from "@tanstack/react-router";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { PageHeader } from "@/components/page-header";
import type { UsersSearch } from "@/lib/search-schemas";
import { useUsers } from "../query-options";
import { UsersTable } from "./users-table";

export function UsersView() {
  const search = useSearch({ from: "/_protected/users/" });
  const navigate = useNavigate({ from: "/users/" });
  const usersQ = useUsers(search);

  const setSearch = (patch: Partial<UsersSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const hasActiveFilters = Boolean(search.search);
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });
  const total = usersQ.data?.pagination.total;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description={
          total !== undefined && !hasActiveFilters
            ? `${total.toLocaleString()} customer accounts.`
            : "Customer accounts and their plans."
        }
      />

      {usersQ.isError && !usersQ.data ? (
        <ComponentErrorState
          title="Couldn't load users"
          error={usersQ.error}
          onRetry={() => void usersQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            search={search.search}
            onSearchChange={(value) =>
              setSearch({ search: value, page: undefined })
            }
            searchPlaceholder="Search name or email"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />
          <UsersTable
            data={usersQ.data}
            isLoading={usersQ.isPending}
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
