import { buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ComponentErrorState } from "@/components/async-boundary";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { DetailViewSkeleton } from "@/components/skeletons";
import {
  PaymentStatusPill,
  PlanStatusPill,
  RequestStatusPill,
  UserStatusPill,
} from "@/components/status-pill";
import {
  capitalise,
  formatDate,
  formatMoney,
  formatMonthYear,
} from "@/lib/format";
import { paymentsQueryOptions } from "@/modules/payments/query-options";
import { usePlans } from "@/modules/plans/query-options";
import { useServiceRequests } from "@/modules/service-requests/query-options";
import { useUserSummary } from "../query-options";

const rowClass =
  "flex items-center justify-between gap-4 border-t border-border py-4 first:border-0 first:pt-0 hover:opacity-80";

export function UserDetailView() {
  const { id } = useParams({ from: "/_protected/users/$id" });
  const { user, isPending } = useUserSummary(id);
  const plansQ = usePlans({ ownerId: id, limit: 50 });
  const requestsQ = useServiceRequests({ ownerId: id, limit: 50 });
  // Payments can't be filtered by owner id; the search matches the customer's email.
  const paymentsQ = useQuery({
    ...paymentsQueryOptions({ search: user?.email, limit: 10 }),
    enabled: Boolean(user?.email),
  });

  if (isPending && !user) return <DetailViewSkeleton />;

  if (plansQ.isError || requestsQ.isError) {
    return (
      <ComponentErrorState
        title="Couldn't load this user"
        error={plansQ.error ?? requestsQ.error}
        onRetry={() => {
          void plansQ.refetch();
          void requestsQ.refetch();
        }}
      />
    );
  }

  const plans = plansQ.data?.items ?? [];
  const requests = requestsQ.data?.items ?? [];
  const payments = user ? (paymentsQ.data?.items ?? []) : [];
  const name = user?.name ?? "Customer";

  return (
    <main className="flex max-w-[960px] flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Users", to: "/users" }, { label: name }]}
        title={name}
        badge={user?.status && <UserStatusPill status={user.status} />}
        description={
          user
            ? `${user.email}${user.createdAt ? ` · Joined ${formatDate(user.createdAt)}` : ""}`
            : "This customer has no plans yet, so their profile details aren't available."
        }
      />

      <SectionCard title={`Plans (${plansQ.data?.pagination.total ?? 0})`}>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No plans yet.</p>
        ) : (
          plans.map((p) => (
            <Link
              key={p._id}
              to="/plans/$id"
              params={{ id: p._id }}
              className={rowClass}
            >
              <div className="min-w-0">
                <div className="text-[15px] font-bold">
                  {p.coveredPerson.fullName}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {capitalise(p.coveredPerson.relationship)} ·{" "}
                    {p.packageDetails.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatMoney(p.totalContributedAmount, p.currency)} saved ·
                  started {formatMonthYear(p.startDate)}
                </div>
              </div>
              <PlanStatusPill status={p.status} />
            </Link>
          ))
        )}
      </SectionCard>

      <SectionCard
        title={`Service requests (${requestsQ.data?.pagination.total ?? 0})`}
      >
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No service requests.</p>
        ) : (
          requests.map((r) => (
            <Link
              key={r._id}
              to="/service-requests/$id"
              params={{ id: r._id }}
              className={rowClass}
            >
              <div className="min-w-0">
                <div className="text-[15px] font-bold">
                  {r.coveredPersonSnapshot.fullName}&rsquo;s service
                </div>
                <div className="text-xs text-muted-foreground">
                  Requested {formatDate(r.createdAt)} · {r.serviceLocation}
                </div>
              </div>
              <RequestStatusPill status={r.status} />
            </Link>
          ))
        )}
      </SectionCard>

      {user && (
        <SectionCard
          title="Recent payments"
          action={
            <Link
              to="/payments"
              search={{ search: user.email }}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "h-auto p-0",
              )}
            >
              All payments
            </Link>
          }
        >
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {paymentsQ.isPending ? "Loading…" : "No payments yet."}
            </p>
          ) : (
            payments.map((p) => (
              <div key={p._id} className={rowClass}>
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold">
                    {p.reference}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">
                    {formatMoney(p.amount, p.currency)}
                  </span>
                  <PaymentStatusPill status={p.status} />
                </div>
              </div>
            ))
          )}
        </SectionCard>
      )}
    </main>
  );
}
