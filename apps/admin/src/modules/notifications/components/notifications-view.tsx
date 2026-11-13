import { Button } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCheck, Trash2 } from "lucide-react";
import { ComponentErrorState } from "@/components/async-boundary";
import { DataTableCard } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  DataTableFilter,
  DataTableToolbar,
} from "@/components/data-table/data-table-toolbar";
import { useUrlPagination } from "@/components/data-table/use-server-table";
import { PageHeader } from "@/components/page-header";
import { TableCardSkeleton } from "@/components/skeletons";
import { formatDateTime } from "@/lib/format";
import type { NotificationsSearch } from "@/lib/search-schemas";
import {
  useDeleteNotificationMutation,
  useMarkNotificationReadMutation,
} from "../mutations";
import { KIND, kindOf, READ_FILTER_OPTIONS } from "../notifications.utils";
import { useAdminNotifications } from "../query-options";

export function NotificationsView() {
  const search = useSearch({ from: "/_protected/notifications" });
  const navigate = useNavigate({ from: "/notifications" });
  const notesQ = useAdminNotifications({
    page: search.page,
    limit: search.limit,
    title: search.search,
    isRead: search.status ? search.status === "read" : undefined,
  });
  const markRead = useMarkNotificationReadMutation();
  const remove = useDeleteNotificationMutation();

  const setSearch = (patch: Partial<NotificationsSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  const setFilter = (patch: Partial<NotificationsSearch>) =>
    setSearch({ ...patch, page: undefined });
  const { pagination, onPaginationChange } = useUrlPagination(
    search,
    setSearch,
  );

  const hasActiveFilters = Boolean(search.search || search.status);
  const resetFilters = () =>
    navigate({ search: { limit: search.limit }, replace: true });

  const notes = notesQ.data?.items ?? [];
  const meta = notesQ.data?.pagination;
  const totalUnread = notesQ.data?.counts.totalUnreadNotifications ?? 0;
  const unreadOnPage = notes.filter((n) => !n.isRead).map((n) => n._id);

  return (
    <main className="flex max-w-[1000px] flex-col gap-6">
      <PageHeader
        title="Notifications"
        description={
          totalUnread > 0
            ? `${totalUnread} unread. New plans, service requests, documents, and contact messages.`
            : "New plans, service requests, documents, and contact messages."
        }
        actions={
          <Button
            variant="outline"
            size="lg"
            disabled={unreadOnPage.length === 0 || markRead.isPending}
            onClick={() => markRead.mutate(unreadOnPage)}
          >
            <CheckCheck />
            Mark page as read
          </Button>
        }
      />

      {notesQ.isError && !notesQ.data ? (
        <ComponentErrorState
          title="Couldn't load notifications"
          error={notesQ.error}
          onRetry={() => void notesQ.refetch()}
        />
      ) : (
        <DataTableCard>
          <DataTableToolbar
            search={search.search}
            onSearchChange={(value) => setFilter({ search: value })}
            searchPlaceholder="Search titles"
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          >
            <DataTableFilter
              label="Show"
              value={search.status}
              options={READ_FILTER_OPTIONS}
              onChange={(status) => setFilter({ status })}
            />
          </DataTableToolbar>

          {notesQ.isPending ? (
            <TableCardSkeleton />
          ) : notes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-serif text-2xl">
                {hasActiveFilters ? "No matches" : "All caught up"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "No notifications match your search and filters."
                  : "New operational events will show up here."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {notes.map((n) => {
                const { icon: Icon, box, link } = KIND[kindOf(n)];
                const unread = !n.isRead;
                return (
                  <li
                    key={n._id}
                    className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-4 size-2 shrink-0 rounded-full",
                          unread ? "bg-accent" : "bg-transparent",
                        )}
                      />
                      {unread && <span className="sr-only">Unread:</span>}
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl",
                          box,
                        )}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm",
                            unread ? "font-bold" : "font-semibold",
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="text-[13px] leading-relaxed text-ink-soft">
                          {n.message}{" "}
                          {link && (
                            <Link
                              to={link.to}
                              onClick={() => unread && markRead.mutate([n._id])}
                              className="font-semibold text-link underline"
                            >
                              {link.label}
                            </Link>
                          )}
                        </p>
                        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {unread && (
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={markRead.isPending}
                          onClick={() => markRead.mutate([n._id])}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete notification"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(n._id)}
                        className="size-8 text-muted-foreground hover:text-status-cancelled"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <DataTablePagination
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={meta?.totalPages ?? 1}
            totalRows={meta?.total ?? 0}
            onPageChange={(pageIndex) =>
              onPaginationChange({ ...pagination, pageIndex })
            }
            onPageSizeChange={(pageSize) =>
              onPaginationChange({ ...pagination, pageSize })
            }
            noun={["notification", "notifications"]}
          />
        </DataTableCard>
      )}
    </main>
  );
}
