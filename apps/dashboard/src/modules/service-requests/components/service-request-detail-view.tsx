import type { ServiceRequest } from "@journeyhome/schemas";
import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { ServiceRequestDetailSkeleton } from "@/components/skeletons";
import { Pill } from "@/components/status-pill";
import { ApiError } from "@/lib/api";
import { capitalise, formatDate } from "@/lib/format";
import { usePlans } from "@/modules/plans/query-options";
import { useServiceRequest } from "@/modules/service-requests/query-options";
import {
  canUploadDocuments,
  moreInfoReason,
  rejectionReason,
  requestMessage,
  requestState,
} from "@/modules/service-requests/service-requests.utils";
import { RequestDocuments } from "./request-documents";
import { RequestProgress } from "./request-progress";

/** Dates the API stores as UTC calendar days (midnight UTC) must be read back in UTC. */
const utcDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

function Detail({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-3" : undefined}>
      <div className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-line text-[15px] font-medium">
        {value || "—"}
      </div>
    </div>
  );
}

/** The team's latest message about the request, surfaced where the customer is looking. */
function Update({ req, text }: { req: ServiceRequest; text: string }) {
  if (!text) return null;
  const moreInfo = req.status === "More_Info_Required";
  const rejected = req.status === "Rejected";
  const flagged = moreInfo || rejected;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl px-5 py-4 text-sm leading-relaxed",
        moreInfo && "bg-cream text-status-due",
        rejected && "bg-status-cancelled-bg text-status-cancelled",
        !flagged && "bg-canvas/10 text-canvas/90",
      )}
    >
      {flagged && <AlertCircle className="mt-0.5 size-4 shrink-0" />}
      <div>
        {moreInfo && <div className="mb-0.5 font-bold">We need a bit more</div>}
        {rejected && (
          <div className="mb-0.5 font-bold">
            We couldn&rsquo;t approve this request
          </div>
        )}
        {text}
      </div>
    </div>
  );
}

export function ServiceRequestDetailView() {
  const { id } = useParams({ from: "/app/service-requests/$id" });
  const q = useServiceRequest(id);
  const plansQ = usePlans();

  if (q.isPending) return <ServiceRequestDetailSkeleton />;
  if (q.isError || !q.data) {
    const missing =
      q.error instanceof ApiError &&
      (q.error.status === 404 || q.error.status === 400);
    return (
      <main className="flex max-w-4xl flex-1 flex-col items-start gap-3">
        <h1 className="font-serif text-4xl">
          {missing ? "We couldn’t find that request" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground">
          {missing
            ? "It may have been removed, or it belongs to a different account."
            : q.error?.message}
        </p>
        <div className="flex gap-4 text-sm font-bold">
          {!missing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void q.refetch()}
            >
              Try again
            </Button>
          )}
          <Link
            to="/app/service-requests"
            className={cn(buttonVariants({ variant: "link", size: "sm" }))}
          >
            Back to service requests
          </Link>
        </div>
      </main>
    );
  }

  const { request: req } = q.data;
  // The documents are sent both at the top level and on the request; prefer the top-level list.
  const documents = q.data.documents.length ? q.data.documents : req.documents;
  const plan = plansQ.data?.find((p) => p._id === req.plan);
  const state = requestState(req, plan);
  const person = req.coveredPersonSnapshot;
  const canUpload = canUploadDocuments(req);
  const update =
    req.status === "More_Info_Required"
      ? (moreInfoReason(req) ?? requestMessage(req, plan, documents))
      : req.status === "Rejected"
        ? (rejectionReason(req) ?? requestMessage(req, plan, documents))
        : requestMessage(req, plan, documents);

  return (
    <main className="flex max-w-4xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="text-sm text-muted-foreground">
          <Link to="/app" className="hover:underline">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link to="/app/service-requests" className="hover:underline">
            Service requests
          </Link>{" "}
          / {person.fullName}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="page-title">
            {person.fullName}&rsquo;s <span className="italic">service</span>
          </h1>
          <Pill label={state.label} tone={state.tone} />
        </div>
      </header>

      <section
        aria-label="Request status"
        className="flex flex-col gap-5 rounded-[28px] bg-foreground p-6 text-canvas sm:p-8"
      >
        <div className="text-sm text-canvas/70">
          Requested {formatDate(req.createdAt)} · {req.serviceLocation}
        </div>
        <RequestProgress step={state.step} dark />
        <Update req={req} text={update} />
      </section>

      <section
        aria-label="Documents"
        className="flex flex-col gap-5 rounded-[28px] bg-white p-6 sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-[28px] font-normal">Documents</h2>
          <p className="text-sm text-muted-foreground">
            JPG, PNG or PDF, up to 10 MB each. We&rsquo;ll let you know as soon
            as each one is reviewed.
          </p>
        </div>
        <RequestDocuments
          requestId={req._id}
          documents={documents}
          canUpload={canUpload}
        />
      </section>

      <section
        aria-label="Request details"
        className="flex flex-col gap-6 rounded-[28px] bg-white p-6 sm:p-8"
      >
        <h2 className="font-serif text-[28px] font-normal">Request details</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Detail label="Covered person" value={person.fullName} />
          <Detail
            label="Relationship"
            value={capitalise(person.relationship)}
          />
          <Detail label="Date of death" value={utcDay(req.dateOfDeath)} />
          <Detail
            label="Expected service date"
            value={utcDay(req.expectedServiceDate)}
          />
          <Detail label="Contact person" value={req.contactPerson} />
          <Detail label="Contact phone" value={req.contactPhone} />
          <Detail label="Service location" value={req.serviceLocation} wide />
          {req.photographerName && (
            <Detail label="Photographer" value={req.photographerName} />
          )}
          {req.photographerPhoneNo && (
            <Detail
              label="Photographer's phone"
              value={req.photographerPhoneNo}
            />
          )}
          {req.additionalInformation && (
            <Detail
              label="Additional information"
              value={req.additionalInformation}
              wide
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default ServiceRequestDetailView;
