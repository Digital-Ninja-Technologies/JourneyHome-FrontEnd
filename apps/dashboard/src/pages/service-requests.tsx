import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { RequestDocuments } from "@/components/request-documents";
import { Pill } from "@/components/status-pill";
import { formatDay } from "@/lib/format";
import { usePlans, useServiceRequests } from "@/lib/queries";
import {
  ELIGIBLE_PLAN,
  requestMessage,
  requestState,
  STEPS,
} from "@/lib/service-requests";
import type { Plan, ServiceRequest } from "@/lib/types";

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

function ActiveRequest({ req, plan }: { req: ServiceRequest; plan?: Plan }) {
  const state = requestState(req, plan);
  const moreInfo = req.status === "More_Info_Required";
  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-5 rounded-[28px] bg-foreground p-8 text-canvas">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[2px] text-accent">
              Active request
            </div>
            <h2 className="mt-1 font-serif text-[30px] font-normal">
              {req.coveredPersonSnapshot.fullName}&rsquo;s service
            </h2>
            <div className="text-sm text-canvas/70">
              Requested {formatDay(req.createdAt)} · {req.burialLocation}
            </div>
          </div>
          <Pill
            label={state.label}
            tone={state.tone}
            className="shrink-0 bg-white/90"
          />
        </div>
        <div className="grid grid-cols-5 gap-3" aria-hidden>
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full",
                i < state.step ? "bg-accent" : "bg-canvas/15",
              )}
            />
          ))}
        </div>
        <ol className="grid grid-cols-5 gap-3 text-xs">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={cn(
                i === state.step - 1
                  ? "font-bold text-accent"
                  : i < state.step
                    ? "text-accent/80"
                    : "text-canvas/70",
              )}
            >
              {s}
            </li>
          ))}
        </ol>
        <p
          className={cn(
            "text-sm leading-relaxed",
            moreInfo
              ? "rounded-xl bg-cream px-4 py-3 text-status-due"
              : "text-canvas/90",
          )}
        >
          {requestMessage(req, plan)}
        </p>
        <div>
          <Link
            to="/app/service-requests/new"
            className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-bold text-foreground"
          >
            Request another service
          </Link>
        </div>
      </section>
      <section
        className="rounded-3xl bg-white px-7 py-5"
        aria-label="Documents"
      >
        <h3 className="mb-2 font-serif text-xl font-normal">Documents</h3>
        <RequestDocuments
          requestId={req._id}
          canUpload={req.status !== "Approved"}
        />
      </section>
    </div>
  );
}

function PastRequest({ req, plan }: { req: ServiceRequest; plan?: Plan }) {
  const state = requestState(req, plan);
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-7">
      <div>
        <div className="flex items-center gap-3">
          <div className="text-[17px] font-bold">
            {req.coveredPersonSnapshot.fullName}&rsquo;s service
          </div>
          <Pill label={state.label} tone={state.tone} />
        </div>
        <div className="mt-1 text-sm text-muted">
          Requested {formatDay(req.createdAt)} · {req.burialLocation}
          {req.status === "Rejected" && req.rejectionReason
            ? ` · ${req.rejectionReason}`
            : ""}
        </div>
      </div>
    </div>
  );
}

export default function ServiceRequests() {
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
    <main className="flex max-w-[1200px] flex-col gap-8 p-5 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted">
            <Link to="/app" className="hover:underline">
              Dashboard
            </Link>{" "}
            / Service requests
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">
            Service <span className="italic">requests</span>
          </h1>
        </div>
        {active.length === 0 && canRequest && (
          <Link
            to="/app/service-requests/new"
            className="inline-flex h-[52px] items-center rounded-2xl bg-foreground px-6 text-sm font-semibold text-canvas"
          >
            Request service
          </Link>
        )}
      </header>

      {reqQ.isPending && <p className="text-muted">Loading your requests…</p>}
      {reqQ.isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled"
        >
          <span>
            We couldn&rsquo;t load your service requests. {reqQ.error.message}
          </span>
          <button
            className="font-bold underline"
            onClick={() => void reqQ.refetch()}
          >
            Try again
          </button>
        </div>
      )}
      {reqQ.isSuccess && requests.length === 0 && (
        <div className="rounded-3xl border border-dashed border-foreground/30 p-8">
          <div className="font-serif text-2xl">No service requests yet</div>
          <p className="mt-1 max-w-lg text-sm text-muted">
            {canRequest
              ? "When the time comes, submit a request and we'll take care of the rest."
              : "A service can be requested once you have an active plan."}
          </p>
        </div>
      )}

      {active.map((r) => (
        <ActiveRequest key={r._id} req={r} plan={plans.get(r.plan)} />
      ))}

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
              <div className="text-sm leading-relaxed text-muted">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-[28px] font-normal">Past requests</h2>
          {past.map((r) => (
            <PastRequest key={r._id} req={r} plan={plans.get(r.plan)} />
          ))}
        </section>
      )}
    </main>
  );
}
