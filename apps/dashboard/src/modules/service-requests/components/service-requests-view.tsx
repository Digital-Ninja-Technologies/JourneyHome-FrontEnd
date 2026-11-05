import type { Plan, ServiceRequest } from "@journeyhome/schemas";
import { buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, FileText } from "lucide-react";
import {
  AsyncBoundary,
  ServiceRequestsListSkeleton,
} from "@/components/async-boundary";
import { Pill } from "@/components/status-pill";
import { formatDay } from "@/lib/format";
import { usePlans } from "@/modules/plans/query-options";
import { useServiceRequests } from "@/modules/service-requests/query-options";
import {
  canUploadDocuments,
  documentsSummary,
  ELIGIBLE_PLAN,
  rejectionReason,
  requestMessage,
  requestState,
} from "@/modules/service-requests/service-requests.utils";
import { RequestProgress } from "./request-progress";

const HOW = [
  [
    "You submit details",
    "Which plan, the date, and the location of the service.",
  ],
  [
    "We verify & approve",
    "Your documents are checked and your request is reviewed.",
  ],
  [
    "We coordinate the day",
    "Our team confirms the logistics with you directly.",
  ],
  [
    "You receive the keepsake",
    "A digital gallery, and for Standard/Premium, a printed album.",
  ],
];

/** The card is one link to the request (the title's link is stretched over it). */
function RequestTitle({ req }: { req: ServiceRequest }) {
  return (
    <Link
      to="/app/service-requests/$id"
      params={{ id: req._id }}
      className="text-[19px] font-bold leading-tight outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline-2 focus-visible:after:outline-accent"
    >
      {req.coveredPersonSnapshot.fullName}&rsquo;s service
    </Link>
  );
}

function ActiveRequest({ req, plan }: { req: ServiceRequest; plan?: Plan }) {
  const state = requestState(req, plan);
  const moreInfo = req.status === "More_Info_Required";
  const docs = documentsSummary(req.documents);
  const actionNeeded = canUploadDocuments(req) && docs.needsAttention > 0;

  return (
    <article className="group relative flex flex-col gap-5 rounded-3xl bg-white p-6 transition-shadow hover:shadow-md sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <RequestTitle req={req} />
          <div className="mt-1 text-sm text-muted-foreground">
            Requested {formatDay(req.createdAt)} · {req.serviceLocation}
          </div>
        </div>
        <Pill label={state.label} tone={state.tone} className="shrink-0" />
      </div>

      <RequestProgress step={state.step} />

      <p
        className={cn(
          "text-sm leading-relaxed",
          moreInfo
            ? "rounded-xl bg-cream px-4 py-3 text-status-due"
            : "text-ink-soft",
        )}
      >
        {requestMessage(req, plan)}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div
          className={cn(
            "flex items-center gap-2 text-sm",
            actionNeeded
              ? "font-semibold text-status-due"
              : "text-muted-foreground",
          )}
        >
          {actionNeeded ? (
            <AlertCircle className="size-4" />
          ) : (
            <FileText className="size-4" />
          )}
          {docs.resubmit > 0
            ? `${docs.resubmit} document${docs.resubmit === 1 ? "" : "s"} need${docs.resubmit === 1 ? "s" : ""} a new copy`
            : docs.uploaded < docs.required
              ? `${docs.uploaded} of ${docs.required} documents uploaded`
              : "All documents uploaded"}
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-link group-hover:underline">
          {actionNeeded ? "Upload documents" : "View details"}
          <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
  );
}

function PastRequest({ req, plan }: { req: ServiceRequest; plan?: Plan }) {
  const state = requestState(req, plan);
  const reason = req.status === "Rejected" ? rejectionReason(req) : undefined;
  return (
    <article className="group relative flex items-center justify-between gap-4 rounded-3xl bg-white p-6 transition-shadow hover:shadow-md">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <RequestTitle req={req} />
          <Pill label={state.label} tone={state.tone} />
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Requested {formatDay(req.createdAt)} · {req.serviceLocation}
        </div>
        {reason && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{reason}</p>
        )}
      </div>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
    </article>
  );
}

export function ServiceRequestsView() {
  const reqQ = useServiceRequests();
  const plansQ = usePlans();
  const plans = new Map((plansQ.data ?? []).map((p) => [p._id, p]));
  const requests = [...(reqQ.data ?? [])].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  const closed = (r: ServiceRequest) =>
    requestState(r, plans.get(r.plan)).closed;
  const active = requests.filter((r) => !closed(r));
  const past = requests.filter(closed);
  const canRequest = (plansQ.data ?? []).some((p) =>
    ELIGIBLE_PLAN.has(p.status),
  );

  return (
    <main className="flex flex-1 flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link to="/app" className="hover:underline">
              Dashboard
            </Link>{" "}
            / Service requests
          </div>
          <h1 className="page-title">
            Service <span className="italic">requests</span>
          </h1>
        </div>
        {canRequest && (
          <Link
            to="/app/service-requests/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-[52px] rounded-2xl px-6 text-sm font-semibold",
            )}
          >
            Request service
          </Link>
        )}
      </header>

      <AsyncBoundary
        isLoading={reqQ.isPending}
        isError={reqQ.isError}
        error={reqQ.error}
        onReset={() => void reqQ.refetch()}
        loadingFallback={<ServiceRequestsListSkeleton count={3} />}
      >
        {requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-foreground/30 p-8">
            <div className="font-serif text-2xl">No service requests yet</div>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              {canRequest
                ? "When the time comes, submit a request and we'll take care of the rest."
                : "A service can be requested once you have an active plan."}
            </p>
            {!canRequest && (
              <Link
                to="/app/plans"
                className="mt-3 inline-block text-sm font-bold text-link underline"
              >
                Go to my plans
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {active.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="font-serif text-[28px] font-normal">
                  In progress
                </h2>
                {active.map((r) => (
                  <ActiveRequest key={r._id} req={r} plan={plans.get(r.plan)} />
                ))}
              </section>
            )}
            {past.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="font-serif text-[28px] font-normal">
                  Past requests
                </h2>
                {past.map((r) => (
                  <PastRequest key={r._id} req={r} plan={plans.get(r.plan)} />
                ))}
              </section>
            )}
          </div>
        )}
      </AsyncBoundary>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[28px] font-normal">
          What happens after you request
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {HOW.map(([title, body], i) => (
            <div
              key={title}
              className="flex flex-col gap-2.5 rounded-3xl bg-white p-6"
            >
              <div className="grid size-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-canvas">
                {i + 1}
              </div>
              <div className="text-[17px] font-bold">{title}</div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                {body}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ServiceRequestsView;
