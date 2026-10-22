import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";
import { CreatePlanDialog } from "../components/CreatePlanDialog";
import { NoticeBanner } from "../components/NoticeBanner";
import { StatusPill } from "../components/StatusPill";
import { formatMoney } from "../lib/format";
import {
	contributionCount,
	fullName,
	lastPaymentLabel,
	nextCell,
	planNotice,
	relationshipLabel,
	startedLabel,
	canPayNow,
} from "../lib/plans";
import { usePlans } from "../lib/queries";
import type { Plan } from "../lib/types";

const FINISHED = new Set<Plan["status"]>(["Completed", "Cancelled", "Expired"]);

function Stat({
	label,
	value,
	dark,
	accent,
}: {
	label: string;
	value: string;
	dark: boolean;
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
					"mt-1 text-[32px] font-bold leading-tight tracking-tight",
					accent && "text-link",
				)}
			>
				{value}
			</div>
		</div>
	);
}

function PlanSection({ plan }: { plan: Plan }) {
	const dark = plan.status === "Active";
	const finished = FINISHED.has(plan.status);
	const notice = planNotice(plan);
	const next = nextCell(plan);
	const money = (n: number) => formatMoney(n, plan.currency);
	const primary = canPayNow(plan)
		? {
				to: "/app/payments/new" as const,
				search: { plan: plan._id },
				label: "Complete payment",
			}
		: null;
	const meta = `${relationshipLabel(plan)} · ${plan.packageSnapshot.name} package · ${
		plan.status === "Completed"
			? "Service completed"
			: `Started ${startedLabel(plan)}`
	}`;
	const review = [
		"Service_Request",
		"Under_Review",
		"Approved",
		"Service_Scheduled",
	].includes(plan.status);
	const secondary = review
		? {
				to: "/app/service-requests" as const,
				params: undefined,
				label: "View request",
			}
		: finished || plan.status === "Pending"
			? null
			: {
					to: "/app/plans/$id" as const,
					params: { id: plan._id },
					label: "View details",
				};

	return (
		<section
			aria-label={`Plan for ${fullName(plan)}`}
			className={cn(
				"flex flex-col gap-6 rounded-[28px] p-8",
				dark
					? "bg-foreground text-canvas"
					: finished
						? "border border-border bg-canvas"
						: "border border-border bg-white",
			)}
		>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5">
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
							className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-foreground"
						>
							{primary.label}
						</Link>
					)}
					{secondary && (
						<Link
							to={secondary.to}
							params={secondary.params}
							className={cn(
								"inline-flex h-11 items-center rounded-xl border px-5 text-sm font-semibold",
								dark ? "border-canvas/30" : "border-foreground",
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

export default function Plans() {
	const plansQ = usePlans();
	const navigate = useNavigate({ from: "/app/plans/" });
	const search = useSearch({ from: "/app/plans/" });
	const open = search.new === "1";
	const setOpen = (o: boolean) =>
		navigate({ search: o ? { new: "1" } : {}, replace: true });

	// Newest first, finished plans last.
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
				<button
					onClick={() => setOpen(true)}
					className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-foreground px-6 text-sm font-semibold text-canvas"
				>
					<Plus className="size-4" /> Create new plan
				</button>
			</header>

			{plansQ.isPending && <p className="text-muted">Loading your plans…</p>}
			{plansQ.isError && (
				<div
					role="alert"
					className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled"
				>
					<span>We couldn&rsquo;t load your plans. {plansQ.error.message}</span>
					<button
						className="font-bold underline"
						onClick={() => void plansQ.refetch()}
					>
						Try again
					</button>
				</div>
			)}
			{plans.map((p) => (
				<PlanSection key={p._id} plan={p} />
			))}

			<button
				onClick={() => setOpen(true)}
				className="flex items-center gap-5 rounded-[28px] border border-dashed border-foreground/30 p-7 text-left"
			>
				<span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-sand">
					<Plus className="size-5" />
				</span>
				<span>
					<span className="block font-serif text-2xl">
						{plans.length ? "Plan for someone else" : "Start your first plan"}
					</span>
					<span className="text-sm text-muted">
						Parents, grandparents, uncles, aunts — one plan per person, all
						tracked separately in this account.
					</span>
				</span>
			</button>
			<CreatePlanDialog open={open} onClose={() => setOpen(false)} />
		</main>
	);
}
