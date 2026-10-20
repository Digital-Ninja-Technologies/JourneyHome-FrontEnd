import { Link, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";
import { NoticeBanner } from "../components/NoticeBanner";
import { PAYMENT_TEXT, StatusPill } from "../components/StatusPill";
import { ApiError } from "../lib/api";
import { capitalise, formatDay, formatMoney, formatMonthYear } from "../lib/format";
import { MARKETING_URL, canPayNow, contributionCount, nextCell, payLink, planNotice, startedLabel } from "../lib/plans";
import { usePayments, usePlan } from "../lib/queries";

function Detail({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-3" : undefined}>
      <div className="text-xs font-semibold uppercase tracking-[2px] text-muted">{label}</div>
      <div className="mt-1 text-[15px] font-medium">{value || "—"}</div>
    </div>
  );
}

export default function PlanDetail() {
  const { id } = useParams();
  const planQ = usePlan(id);
  const paymentsQ = usePayments();
  const plan = planQ.data;

  if (planQ.isPending) return <main className="p-10 text-muted">Loading plan…</main>;
  if (planQ.isError || !plan) {
    const missing = planQ.error instanceof ApiError && (planQ.error.status === 404 || planQ.error.status === 400);
    return (
      <main className="flex flex-col items-start gap-3 p-10">
        <h1 className="font-serif text-4xl">{missing ? "We couldn’t find that plan" : "Something went wrong"}</h1>
        <p className="text-muted">{missing ? "It may have been removed, or it belongs to a different account." : planQ.error?.message}</p>
        <div className="flex gap-4 text-sm font-bold text-link">
          {!missing && <button className="underline" onClick={() => void planQ.refetch()}>Try again</button>}
          <Link to="/app/plans" className="underline">Back to my plans</Link>
        </div>
      </main>
    );
  }

  const [first, ...rest] = plan.coveredPerson.fullName.split(" ");
  const money = (n: number) => formatMoney(n, plan.currency);
  const next = nextCell(plan);
  const notice = planNotice(plan);
  const person = plan.coveredPerson;
  const history = (paymentsQ.data ?? []).filter((p) => p.plan === plan._id && p.status !== "Pending");
  const canPay = canPayNow(plan);

  return (
    <main className="flex max-w-[800px] flex-col gap-6 p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted">
            <Link to="/app" className="hover:underline">Dashboard</Link> /{" "}
            <Link to="/app/plans" className="hover:underline">My plans</Link> / {person.fullName}
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[52px] font-normal leading-[1.05]">
              {first} {rest.length > 0 && <span className="italic">{rest.join(" ")}</span>}
            </h1>
            <StatusPill status={plan.status} />
          </div>
        </div>
        {canPay && (
          <Link to={payLink(plan)} className="inline-flex h-12 items-center rounded-2xl bg-accent px-6 text-sm font-bold text-foreground">
            Complete payment
          </Link>
        )}
      </header>

      {notice && <NoticeBanner notice={notice} />}

      <section aria-label="Plan summary" className="flex flex-col gap-5 rounded-[28px] bg-foreground p-8 text-canvas">
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            ["Total saved", money(plan.totalContributedMinor)],
            ["Monthly contribution", money(plan.contributionAmountMinor)],
            ["Package", plan.packageSnapshot.name],
            [next.label, next.value],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs font-semibold uppercase tracking-[2px] text-canvas/70">{label}</div>
              <div className="mt-1 text-[28px] font-bold leading-tight tracking-tight">{value}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-canvas/70">
          {contributionCount(plan)} contribution{contributionCount(plan) === 1 ? "" : "s"} made since {startedLabel(plan)} · savings continue for as long as the plan is active, with no fixed end date
        </div>
      </section>

      <section aria-label="Covered person" className="flex flex-col gap-6 rounded-[28px] bg-white p-8">
        <h2 className="font-serif text-[28px] font-normal">Who this plan is for</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Detail label="Full name" value={person.fullName} />
          <Detail label="Relationship" value={capitalise(person.relationship)} />
          <Detail label="Date of birth" value={person.dateOfBirth ? `${formatDay(person.dateOfBirth)} ${new Date(person.dateOfBirth).getUTCFullYear()}` : undefined} />
          <Detail label="Gender" value={capitalise(person.gender ?? "")} />
          <Detail label="Phone number" value={person.phoneNumber} />
          <Detail label="Started" value={formatMonthYear(plan.startDate)} />
          <Detail label="Home address" value={person.address} wide />
        </div>
      </section>

      <section aria-label="Plan payment history" className="flex flex-col gap-1 rounded-[28px] bg-white p-8">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-serif text-[28px] font-normal">Payment history</h2>
          <Link to={`/app/payments?plan=${plan._id}`} className="text-sm font-semibold text-link hover:text-link-hover">See all payments</Link>
        </div>
        {paymentsQ.isPending && <p className="py-4 text-sm text-muted">Loading…</p>}
        {paymentsQ.isError && <p className="py-4 text-sm text-status-cancelled">Couldn&rsquo;t load payments. {paymentsQ.error.message}</p>}
        {paymentsQ.isSuccess && history.length === 0 && <p className="py-4 text-sm text-muted">No payments on this plan yet.</p>}
        {history.slice(0, 3).map((pay) => (
          <div key={pay._id} className="flex items-center justify-between border-t border-border py-4">
            <div className="text-sm text-muted">
              {formatDay(pay.processedAt ?? pay.createdAt)} {new Date(pay.processedAt ?? pay.createdAt).getFullYear()} ·{" "}
              {pay.purpose === "initial_contribution" ? "First contribution" : "Monthly contribution"}
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{formatMoney(pay.amountMinor, pay.currency)}</div>
              <div className={cn("text-xs font-semibold", PAYMENT_TEXT[pay.status])}>{pay.status}</div>
            </div>
          </div>
        ))}
        {history.length > 3 && (
          <div className="border-t border-border pt-4 text-center text-sm">
            <Link to={`/app/payments?plan=${plan._id}`} className="font-semibold text-link">View full history</Link>
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-cream px-5 py-4 text-[13px] leading-relaxed text-status-due">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div>
          The {plan.packageSnapshot.name} package is fixed for the life of this plan and can&rsquo;t be changed once started.{" "}
          <a href={`${MARKETING_URL}/terms`} className="underline">Read the policy</a>
        </div>
      </div>
    </main>
  );
}
