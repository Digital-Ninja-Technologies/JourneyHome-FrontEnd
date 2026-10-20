import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bell, Check, Plus } from "lucide-react";
import { Logo } from "@journeyhome/ui/components/logo";
import { useAuth } from "../auth/AuthContext";
import { StatusPill } from "../components/StatusPill";
import { setOnboardingPlan } from "../lib/checkout";
import { firstName, formatDate, formatMoney } from "../lib/format";
import { relationshipLabel } from "../lib/plans";
import { usePlan } from "../lib/queries";

export default function Welcome() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const planQ = usePlan(params.get("plan") ?? undefined);
  const plan = planQ.data;

  useEffect(() => setOnboardingPlan(null), []);

  const person = plan ? firstName(plan.coveredPerson.fullName) : "";
  const money = plan ? formatMoney(plan.contributionAmountMinor, plan.currency) : "";
  const active = plan?.status === "Active";

  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-6 pb-20 pt-9">
      <Logo />
      <div className="mt-14 flex w-full max-w-[560px] flex-col items-center gap-8">
        <span className="grid size-[68px] place-items-center rounded-full bg-foreground text-accent"><Check className="size-8" /></span>
        <div className="flex flex-col gap-3 text-center">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight">
            You&rsquo;re all set, <span className="font-serif font-normal italic text-link">{user ? firstName(user.name) : ""}.</span>
          </h1>
          {plan && (
            <p className="mx-auto max-w-md text-[15px] leading-relaxed text-muted">
              {active
                ? `${person}'s plan is active and your first contribution of ${money} has been recorded. We'll let you know before each payment is due.`
                : plan.status === "Pending"
                  ? `${person}'s plan is created. We're confirming your first payment — the plan activates as soon as it clears.`
                  : `${person}'s plan is set up.`}
            </p>
          )}
        </div>

        {planQ.isPending && params.get("plan") && <p className="text-sm text-muted">Loading your plan…</p>}
        {plan && (
          <section className="flex w-full flex-col gap-3.5 rounded-[28px] bg-foreground p-7 text-canvas">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-serif text-2xl">{plan.coveredPerson.fullName}</div>
                <div className="text-[13px] text-canvas/70">{relationshipLabel(plan)} · {plan.packageSnapshot.name} package</div>
              </div>
              <StatusPill status={plan.status} className="bg-status-active/40 text-[#9FE0BC]" />
            </div>
            <hr className="border-canvas/15" />
            <div className="flex justify-between text-sm"><span className="text-canvas/70">Monthly contribution</span><span>{money}</span></div>
            {active && <div className="flex justify-between text-sm"><span className="text-canvas/70">Next payment</span><span>{formatDate(plan.nextPaymentDate)}</span></div>}
          </section>
        )}

        <section className="flex w-full flex-col gap-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">What&rsquo;s next</div>
          <Link to="/app/plans?new=1" className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-sm">
            <Plus className="size-4 shrink-0 text-link" />
            <span>Add another plan for someone else — one account can hold as many as you need.</span>
          </Link>
          <Link to="/app/notifications" className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-sm">
            <Bell className="size-4 shrink-0 text-link" />
            <span>Payment and service updates will appear in your <span className="font-semibold text-link underline">notifications</span>.</span>
          </Link>
        </section>

        <Link to="/app" className="inline-flex h-[54px] w-full items-center justify-center rounded-2xl bg-foreground text-sm font-bold text-canvas">Go to my dashboard →</Link>
      </div>
    </div>
  );
}
