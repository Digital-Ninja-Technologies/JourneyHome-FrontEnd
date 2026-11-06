import { Link, useParams } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { DetailGrid, DetailItem } from "@/components/detail-item";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { DetailViewSkeleton } from "@/components/skeletons";
import { PlanStatusPill, RequestStatusPill } from "@/components/status-pill";
import {
  ageFrom,
  capitalise,
  formatDate,
  formatMoney,
  formatMonthYear,
} from "@/lib/format";
import { useServiceRequests } from "@/modules/service-requests/query-options";
import { useOwnerSummary, usePlan } from "../query-options";
import { PlanStatusCard } from "./plan-status-card";

export function PlanDetailView() {
  const { id } = useParams({ from: "/_protected/plans/$id" });
  const planQ = usePlan(id);

  return (
    <AsyncBoundary
      isLoading={planQ.isPending}
      isError={planQ.isError}
      error={planQ.error}
      onReset={() => void planQ.refetch()}
      loadingFallback={<DetailViewSkeleton />}
    >
      {planQ.data && <PlanDetail plan={planQ.data} />}
    </AsyncBoundary>
  );
}

function PlanDetail({
  plan,
}: {
  plan: NonNullable<ReturnType<typeof usePlan>["data"]>;
}) {
  const ownerQ = useOwnerSummary(plan.owner);
  const requestsQ = useServiceRequests({ planId: plan._id, limit: 5 });
  const person = plan.coveredPerson;
  const money = (n: number) => formatMoney(n, plan.currency);
  const owner = ownerQ.data;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Plans", to: "/plans" }, { label: person.fullName }]}
        title={`${person.fullName}'s`}
        accent="plan"
        badge={<PlanStatusPill status={plan.status} />}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title="Plan details">
            <DetailGrid>
              <DetailItem label="Plan owner">
                {owner ? (
                  <Link
                    to="/users/$id"
                    params={{ id: owner._id }}
                    className="hover:underline"
                  >
                    {owner.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {owner.email}
                    </span>
                  </Link>
                ) : ownerQ.isPending ? (
                  "Loading…"
                ) : undefined}
              </DetailItem>
              <DetailItem label="Package">
                {plan.packageDetails.name}
              </DetailItem>
              <DetailItem label="Plan started">
                {formatMonthYear(plan.startDate)}
              </DetailItem>
              <DetailItem label="Balance">
                {money(plan.totalContributedAmount)}
              </DetailItem>
              <DetailItem label="Monthly contribution">
                {money(plan.amount)}
              </DetailItem>
              <DetailItem label="Next payment">
                {plan.status !== "Pending" && plan.nextPaymentDate
                  ? formatDate(plan.nextPaymentDate)
                  : undefined}
              </DetailItem>
            </DetailGrid>
          </SectionCard>

          <SectionCard title="Covered person">
            <DetailGrid>
              <DetailItem label="Full name">{person.fullName}</DetailItem>
              <DetailItem label="Date of birth">
                {person.dateOfBirth
                  ? `${formatDate(person.dateOfBirth)} · ${ageFrom(person.dateOfBirth)} yrs`
                  : undefined}
              </DetailItem>
              <DetailItem label="Gender">
                {capitalise(person.gender)}
              </DetailItem>
              <DetailItem label="Relationship to owner">
                {capitalise(person.relationship)}
              </DetailItem>
              <DetailItem label="Phone">{person.phoneNumber}</DetailItem>
              <DetailItem label="Home address">{person.address}</DetailItem>
            </DetailGrid>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <PlanStatusCard plan={plan} />
          <SectionCard title="Service requests">
            {requestsQ.isPending ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !requestsQ.data?.items.length ? (
              <p className="text-sm text-muted-foreground">
                No service has been requested on this plan.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {requestsQ.data.items.map((r) => (
                  <li key={r._id}>
                    <Link
                      to="/service-requests/$id"
                      params={{ id: r._id }}
                      className="flex items-center justify-between gap-3 py-3 text-sm hover:underline"
                    >
                      <span>Requested {formatDate(r.createdAt)}</span>
                      <RequestStatusPill status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
