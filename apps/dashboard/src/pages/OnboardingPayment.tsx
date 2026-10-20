import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@journeyhome/ui/components/button";
import { OnboardingShell } from "../components/OnboardingShell";
import { useStartCheckout } from "../lib/checkout";
import { firstName, formatMoney } from "../lib/format";
import { relationshipLabel } from "../lib/plans";
import { usePlan } from "../lib/queries";
import type { Plan } from "../lib/types";

function Checkout({ plan }: { plan: Plan }) {
  const start = useStartCheckout(plan._id, { onboarding: true });
  const busy = start.isPending || start.isSuccess;
  const money = formatMoney(plan.contributionAmountMinor, plan.currency);
  return (
    <>
      <section className="flex w-full items-center justify-between gap-4 rounded-[24px] bg-foreground p-6 text-canvas">
        <div>
          <div className="font-serif text-xl">{firstName(plan.coveredPerson.fullName)}&rsquo;s plan</div>
          <div className="text-[13px] text-canvas/70">{relationshipLabel(plan)} · {plan.packageSnapshot.name} package</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{money}</div>
          <div className="text-xs text-canvas/70">charged today</div>
        </div>
      </section>
      <section className="flex w-full items-start gap-3 rounded-[24px] bg-white p-7 text-sm shadow-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-active" />
        <div className="leading-relaxed">
          <div className="font-bold">Secure checkout with Paystack</div>
          <div className="text-muted">
            You&rsquo;ll enter your card or bank details on the next screen. They&rsquo;re encrypted and handled by our payment partner — Journey Home never stores your full card number.
          </div>
        </div>
      </section>
      {start.isError && <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">{start.error.message}</p>}
      <Button variant="accent" size="lg" className="h-[54px] w-full rounded-2xl" disabled={busy} onClick={() => start.mutate()}>
        {busy ? "Taking you to Paystack…" : `Pay ${money} now`}
      </Button>
      <Link to="/app" className="text-center text-xs font-semibold text-muted underline">Skip for now — I&rsquo;ll make my first payment later</Link>
    </>
  );
}

export default function OnboardingPayment() {
  const [params] = useSearchParams();
  const planQ = usePlan(params.get("plan") ?? undefined);
  const plan = planQ.data;

  // Already paid (e.g. the page was reopened after checkout): carry on to the welcome screen.
  if (plan && plan.status !== "Pending") return <Navigate to={`/welcome?plan=${plan._id}`} replace />;

  return (
    <OnboardingShell step={4} title="Make your first" accent="payment." subtitle="Your first contribution starts today; after that it's monthly." exitTo="/app" width="max-w-[480px]">
      {!params.get("plan") && <p className="text-center text-sm text-muted">No plan selected. <Link to="/signup/plan" className="font-bold text-link underline">Set up a plan</Link></p>}
      {params.get("plan") && planQ.isPending && <p className="text-center text-sm text-muted">Loading your plan…</p>}
      {planQ.isError && (
        <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-center text-[13px] text-status-cancelled">
          {planQ.error.message} <Link to="/signup/plan" className="font-bold underline">Set up a plan</Link>
        </p>
      )}
      {plan && <Checkout plan={plan} />}
    </OnboardingShell>
  );
}
