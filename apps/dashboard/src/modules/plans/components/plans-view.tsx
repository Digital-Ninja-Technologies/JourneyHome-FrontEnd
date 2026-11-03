import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { NoticeBanner } from "@/components/notice-banner";
import { StatusPill } from "@/components/status-pill";
import {
  contributionCount,
  fullName,
  lastPaymentLabel,
  nextCell,
  planNotice,
  relationshipLabel,
  startedLabel,
} from "@/modules/plans/plans.utils";
import { formatMoney } from "@/lib/format";
import { usePlans } from "@/lib/queries";
import type { Plan } from "@/lib/types";
import { CreatePlanDialog } from "./create-plan-dialog";

const FINISHED = new Set<Plan["status"]>(["Completed", "Cancelled", "Expired"]);

function Stat({
  label,
  value,
  dark,
  accent,
}: {
  label: string;
  value: string;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[2px]",
          dark ? "text-canvas/70" : "text-muted",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-[28px] font-bold leading-tight tracking-tight",
          accent && "text-accent",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function PlanSection({ plan }: { plan: Plan }) {
  const dark = plan.status === "Active";
  const money = (n: number) => formatMoney(n, plan.currency);
  const next = nextCell(plan);
  const notice = planNotice(plan);
  const finished = FINISHED.has(plan.status);
  const review = plan.status === "Under_Review";

  let primary: { to: string; search?: Record<string, string>; label: string } | null = null;
  let secondary: { to: string; params: { id: string }; label: string } | null = null;

  if (plan.status === "Pending" || plan.status === "Payment_Due" || plan.status === "Overdue") {
    primary = {
      to: "/app/payments/new",
      search: { plan: plan._id },
      label: plan.status === "Pending" ? "Make first payment" : "Complete payment",
    };
    secondary = {
      to: "/app/plans/$id",
      params: { id: plan._id },
      label: "View details",
    };
  } else {
    secondary = {
      to: "/app/plans/$id",
      params: { id: plan._id },
      label: "View plan",
    };
  }

  const meta = `${relationshipLabel(plan)} · ${plan.packageSnapshot.name} package · created ${startedLabel(plan)}`;

  return (
    <section
      aria-label={`${fullName(plan)}'s plan`}
      className={cn(
        "flex flex-col gap-6 rounded-[32px] p-8",
        dark ? "bg-foreground text-canvas" : "border border-border bg-white",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-[32px] font-normal leading-tight">
              {fullName(plan)}
            </h2>
            <StatusPill
              status={plan.status}
              className={
                dark ? "bg-status-active/40 text-[#9FE0BC]" : undefined
              }
            />
          </div>
          <div
            className={cn("text-sm", dark ? "text-canvas/70" : "text-muted")}
          >
            {meta}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {primary && (
            <Link
              to={primary.to}
              search={primary.search}
              className={cn(buttonVariants({ variant: "accent" }))}
            >
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              to={secondary.to}
              params={secondary.params}
              className={cn(
                buttonVariants({ variant: "outline" }),
                dark && "border-canvas/30 text-canvas hover:bg-canvas/10",
              )}
            >
              {secondary.label}
            </Link>
          )}
          {plan.status === "Completed" && (
            <Link
              to="/app/service-requests"
              className="text-sm font-semibold text-link underline"
            >
              View gallery &amp; keepsake
            </Link>
          )}
        </div>
      </div>

      {!finished && !review && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total saved"
            value={money(plan.totalContributedMinor)}
            dark={dark}
          />
          <Stat
            label="Monthly contribution"
            value={money(plan.contributionAmountMinor)}
            dark={dark}
          />
          <Stat
            label={next.label}
            value={next.value}
            dark={dark}
            accent={next.due}
          />
          <Stat
            label="Last payment"
            value={lastPaymentLabel(plan)}
            dark={dark}
          />
        </div>
      )}
      {plan.status === "Active" && (
        <div className="text-xs text-canvas/70">
          {contributionCount(plan)} contribution
          {contributionCount(plan) === 1 ? "" : "s"} made since{" "}
          {startedLabel(plan)} · savings continue for as long as the plan is
          active, with no fixed end date
        </div>
      )}
      {notice && <NoticeBanner notice={notice} />}
    </section>
  );
}

export function PlansView() {
  const plansQ = usePlans();
  const navigate = useNavigate({ from: "/app/plans/" });
  const search = useSearch({ from: "/app/plans/" });
  const open = search.new === "1";
  const setOpen = (o: boolean) =>
    navigate({ search: o ? { new: "1" } : {}, replace: true });

  const plans = [...(plansQ.data ?? [])].sort(
    (a, b) =>
      Number(FINISHED.has(a.status)) - Number(FINISHED.has(b.status)) ||
      +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  return (
    <main className="flex max-w-[1200px] flex-col gap-6 p-5 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted">
            <Link to="/app" className="hover:underline">
              Dashboard
            </Link>{" "}
            / My plans
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">
            My <span className="italic">plans</span>
          </h1>
        </div>
        <Button
          size="lg"
          onClick={() => setOpen(true)}
          className="h-[52px] gap-2 rounded-2xl px-6 text-sm font-semibold"
        >
          <Plus className="size-4" /> Create new plan
        </Button>
      </header>

      {plansQ.isPending && <p className="text-muted">Loading your plans…</p>}
      {plansQ.isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled"
        >
          <span>We couldn&rsquo;t load your plans. {plansQ.error.message}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 font-bold underline text-status-cancelled hover:text-status-cancelled"
            onClick={() => void plansQ.refetch()}
          >
            Try again
          </Button>
        </div>
      )}
      {plans.map((p) => (
        <PlanSection key={p._id} plan={p} />
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-5 rounded-[28px] border border-dashed border-foreground/30 p-7 text-left cursor-pointer transition-colors hover:border-foreground/60"
      >
        <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-sand">
          <Plus className="size-5" />
        </span>
        <span>
          <span className="block font-serif text-2xl">
            Start another plan for someone else
          </span>
          <span className="mt-1 block max-w-md text-sm text-muted">
            Parents, grandparents, spouse, siblings — save for as many family
            members as you need, all managed from this account.
          </span>
        </span>
      </button>

      <CreatePlanDialog open={open} onClose={() => setOpen(false)} />
    </main>
  );
}

export default PlansView;
