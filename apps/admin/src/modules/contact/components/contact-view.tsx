import { useNavigate, useSearch } from "@tanstack/react-router";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { PageHeader } from "@/components/page-header";
import type { ContactSearch } from "@/lib/search-schemas";
import { useContactMessages } from "../query-options";
import { ContactMessageSheet } from "./contact-message-sheet";
import { ContactTable } from "./contact-table";

export function ContactView() {
  const search = useSearch({ from: "/_protected/contact/" });
  const navigate = useNavigate({ from: "/contact/" });
  const { message, ...listParams } = search;
  const messagesQ = useContactMessages(listParams);

  const setSearch = (patch: Partial<ContactSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const hasActiveFilters = Boolean(search.search);
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Contact"
        accent="messages"
        description="Questions sent through the website's contact form."
      />

      {messagesQ.isError && !messagesQ.data ? (
        <ComponentErrorState
          title="Couldn't load messages"
          error={messagesQ.error}
          onRetry={() => void messagesQ.refetch()}
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
          <ContactTable
            data={messagesQ.data}
            isLoading={messagesQ.isPending}
            search={search}
            setSearch={setSearch}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onSelect={(m) => setSearch({ message: m._id })}
          />
        </DataTableCard>
      )}

      <ContactMessageSheet
        id={message}
        onOpenChange={(open) => !open && setSearch({ message: undefined })}
      />
    </main>
  );
}
