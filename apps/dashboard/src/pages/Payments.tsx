import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";
import { PAYMENT_TEXT } from "../components/StatusPill";
import { daysUntil, firstName, formatDay, formatMoney, formatMonthYear } from "../lib/format";
import { LIVE, MARKETING_URL, canPayNow, isDue } from "../lib/plans";
import { usePayments, usePlans } from "../lib/queries";
import type { Payment, Plan } from "../lib/types";

const PAGE = 10;

function SummaryCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "due" }) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-[20px] p-6", tone === "due" ? "bg-cream" : "bg-white shadow-sm")}>
      <div className={cn("text-xs font-semibold uppercase tracking-[2px]", tone === "due" ? "text-status-due" : "text-muted")}>{label}</div>
      <div className={cn("text-[32px] font-bold leading-tight tracking-tight", tone === "due" && "text-[#5C3B0C]")}>{value}</div>
      <div className={cn("text-[13px]", tone === "due" ? "text-status-due" : "text-muted")}>{sub}</div>
    </div>
  );
}

function PaymentRow({ pay, plan }: { pay: Payment; plan?: Plan }) {
  // Only a pending plan's first contribution can be (re)started from here.
  const canResume = plan?.status === "Pending" && pay.purpose === "initial_contribution" && pay.status !== "Successful" && pay.status !== "Refunded";
  const resumeLabel = pay.status === "Failed" || pay.status === "Cancelled" ? "Retry" : "Continue";
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-4">
      <div>
        <div className="text-sm font-semibold">
          Journey Home Plan{plan && <span className="font-normal text-muted"> · {firstName(plan.coveredPerson.fullName)}</span>}
        </div>
        <div className="text-xs text-muted">
          {formatDay(pay.processedAt ?? pay.createdAt)} {new Date(pay.processedAt ?? pay.createdAt).getFullYear()} ·{" "}
          {pay.purpose === "initial_contribution" ? "First contribution" : "Monthly contribution"}
        </div>
        {pay.status === "Failed" && pay.failureMessage && <div className="mt-0.5 text-xs text-status-cancelled">{pay.failureMessage}</div>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-bold">{formatMoney(pay.amountMinor, pay.currency)}</div>
          <div className={cn("text-xs font-semibold", PAYMENT_TEXT[pay.status])}>{pay.status}</div>
        </div>
        {canResume && plan && (
          <Link to="/app/payments/new" search={{ plan: plan._id }} className="inline-flex h-9 items-center rounded-xl bg-foreground px-4 text-xs font-bold text-canvas">
            {resumeLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Payments() {
  const plansQ = usePlans();
  const paymentsQ = usePayments();
  const navigate = useNavigate({ from: "/app/payments/" });
  const { plan: filter } = useSearch({ from: "/app/payments/" });
  const [shown, setShown] = useState(PAGE);

  const plans = plansQ.data ?? [];
  const byId = new Map(plans.map((p) => [p._id, p]));
  const payments = paymentsQ.data ?? [];
  const rows = filter ? payments.filter((p) => p.plan === filter) : payments;

  const successful = payments.filter((p) => p.status === "Successful");
  const firstSuccess = successful.map((p) => p.processedAt ?? p.createdAt).sort()[0];
  const live = plans.filter((p) => LIVE.has(p.status));
  const next = [...live].sort((a, b) => +new Date(a.nextPaymentDate) - +new Date(b.nextPaymentDate))[0];
  const nextDue = next && isDue(next);
  const currency = plans[0]?.currency ?? "NGN";
  const error = plansQ.error ?? paymentsQ.error;

  return (
    <main className="flex max-w-[1200px] flex-col gap-6 p-5 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted">
            <Link to="/app" className="hover:underline">Dashboard</Link> / Payments
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">Payments</h1>
        </div>
        {plans.some(canPayNow) && (
          <Link to="/app/payments/new" className="inline-flex h-[52px] items-center rounded-2xl bg-foreground px-6 text-sm font-semibold text-canvas">
            Make a payment
          </Link>
        )}
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled">
          <span>We couldn&rsquo;t load your payments. {error.message}</span>
          <button className="font-bold underline" onClick={() => { void plansQ.refetch(); void paymentsQ.refetch(); }}>Try again</button>
        </div>
      )}

      <section aria-label="Summary" className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total contributed"
          value={formatMoney(plans.reduce((n, p) => n + p.totalContributedMinor, 0), currency)}
          sub={`across ${plans.length} plan${plans.length === 1 ? "" : "s"}`}
        />
        <SummaryCard
          label="Payments made"
          value={String(successful.length)}
          sub={successful.length ? `since ${formatMonthYear(firstSuccess)}` : "No payments yet"}
        />
        {next ? (
          <SummaryCard
            label={nextDue ? (daysUntil(next.nextPaymentDate) < 0 ? "Overdue" : "Due today") : "Next payment"}
            value={formatMoney(next.contributionAmountMinor, next.currency)}
            sub={`${firstName(next.coveredPerson.fullName)}'s plan${nextDue ? "" : ` · ${formatDay(next.nextPaymentDate)}`}`}
            tone={nextDue ? "due" : undefined}
          />
        ) : (
          <SummaryCard label="Next payment" value="—" sub="Nothing due" />
        )}
      </section>

      <section className="flex flex-col rounded-3xl bg-white p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[28px] font-normal">Payment history</h2>
          {plans.length > 1 && (
            <div className="flex gap-1 rounded-full text-sm" role="group" aria-label="Filter by plan">
              {[{ id: null, label: "All plans" }, ...plans.map((p) => ({ id: p._id, label: firstName(p.coveredPerson.fullName) }))].map((f) => (
                <button
                  key={f.id ?? "all"}
                  aria-pressed={filter === f.id}
                  onClick={() => { navigate({ search: f.id ? { plan: f.id } : {}, replace: true }); setShown(PAGE); }}
                  className={cn("rounded-full px-4 py-2 font-semibold", filter === f.id ? "bg-foreground text-canvas" : "text-muted hover:text-foreground")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {paymentsQ.isPending && <p className="py-6 text-sm text-muted">Loading your payments…</p>}
        {paymentsQ.isSuccess && rows.length === 0 && (
          <p className="border-t border-border py-8 text-sm text-muted">
            {filter ? "No payments on this plan yet." : "No payments yet. They’ll appear here once you make your first contribution."}
          </p>
        )}
        {rows.slice(0, shown).map((pay) => <PaymentRow key={pay._id} pay={pay} plan={byId.get(pay.plan)} />)}
        {rows.length > shown && (
          <div className="border-t border-border pt-4 text-center">
            <button onClick={() => setShown((n) => n + PAGE)} className="text-sm font-semibold text-link">Load earlier payments</button>
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-cream px-5 py-4 text-[13px] leading-relaxed text-status-due">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div>
          A missed payment is never forfeited. It&rsquo;s recorded as a deficit and cleared automatically at your next payment on that plan.{" "}
          <a href={`${MARKETING_URL}/terms`} className="underline">Read the full policy</a>
        </div>
      </div>
    </main>
  );
}
