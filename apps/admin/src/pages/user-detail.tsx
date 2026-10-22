import { Link, useParams } from "react-router-dom";
import { Card, CardTitle, PageHeader, Pill, QueryError } from "@/components/ui";
import {
  capitalise,
  formatDate,
  formatMoney,
  formatMonthYear,
} from "@/lib/format";
import { useAllPlans, useAllRequests, useCustomers } from "@/lib/queries";
import { PLAN_STATUS, REQUEST_STATUS } from "@/lib/status";

export default function UserDetail() {
  const { id } = useParams();
  const customersQ = useCustomers();
  const plansQ = useAllPlans();
  const reqQ = useAllRequests();
  const error = customersQ.error ?? plansQ.error ?? reqQ.error;
  const customer = customersQ.data?.find((c) => c._id === id);

  if (customersQ.isPending || plansQ.isPending || reqQ.isPending)
    return <main className="p-10 text-muted">Loading…</main>;
  if (error)
    return (
      <main className="p-10">
        <QueryError
          error={error}
          retry={() => {
            void customersQ.refetch();
            void plansQ.refetch();
            void reqQ.refetch();
          }}
        />
      </main>
    );
  if (!customer) {
    return (
      <main className="flex flex-col items-start gap-3 p-10">
        <h1 className="font-serif text-4xl">User not found</h1>
        <Link to="/users" className="font-bold text-link underline">
          Back to users
        </Link>
      </main>
    );
  }

  const plans = (plansQ.data ?? []).filter((p) => p.owner === customer._id);
  const requests = (reqQ.data ?? []).filter((r) => r.owner === customer._id);

  return (
    <main className="flex max-w-[860px] flex-col gap-6 p-10">
      <div className="flex flex-col gap-2">
        <PageHeader
          crumb={
            <>
              <Link to="/users" className="hover:underline">
                Users
              </Link>{" "}
              / {customer.name}
            </>
          }
          title={customer.name}
        />
        <p className="text-sm text-muted">
          {customer.email} · Joined {formatDate(customer.createdAt)}
        </p>
      </div>
      <Card>
        <CardTitle className="mb-3">Plans ({plans.length})</CardTitle>
        {plans.length === 0 && (
          <p className="border-t border-border pt-4 text-sm text-muted">
            No plans yet.
          </p>
        )}
        {plans.map((p) => {
          const [label, tone] = PLAN_STATUS[p.status];
          return (
            <Link
              key={p._id}
              to={`/plans/${p._id}`}
              className="flex items-center justify-between gap-4 border-t border-border py-4"
            >
              <div>
                <div className="text-[15px] font-bold">
                  {p.coveredPerson.fullName}{" "}
                  <span className="font-normal text-muted">
                    · {capitalise(p.coveredPerson.relationship)} ·{" "}
                    {p.packageSnapshot.name}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  {formatMoney(p.totalContributedMinor, p.currency)} saved ·
                  started {formatMonthYear(p.startDate)}
                </div>
              </div>
              <Pill label={label} tone={tone} />
            </Link>
          );
        })}
      </Card>
      <Card>
        <CardTitle className="mb-3">
          Service requests ({requests.length})
        </CardTitle>
        {requests.length === 0 && (
          <p className="border-t border-border pt-4 text-sm text-muted">
            No service requests.
          </p>
        )}
        {requests.map((r) => {
          const [label, tone] = REQUEST_STATUS[r.status];
          return (
            <Link
              key={r._id}
              to={`/service-requests/${r._id}`}
              className="flex items-center justify-between gap-4 border-t border-border py-4"
            >
              <div>
                <div className="text-[15px] font-bold">
                  {r.coveredPersonSnapshot.fullName}&rsquo;s service
                </div>
                <div className="text-xs text-muted">
                  Requested {formatDate(r.createdAt)} · {r.burialLocation}
                </div>
              </div>
              <Pill label={label} tone={tone} />
            </Link>
          );
        })}
      </Card>
    </main>
  );
}
