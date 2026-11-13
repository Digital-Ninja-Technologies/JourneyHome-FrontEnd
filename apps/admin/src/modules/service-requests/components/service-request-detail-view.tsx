import type { ServiceRequestDetail } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { formatPhoneDisplay } from "@journeyhome/ui/lib/phone";
import { Link, useParams } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useState } from "react";
import { AsyncBoundary } from "@/components/async-boundary";
import { DetailGrid, DetailItem } from "@/components/detail-item";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { DetailViewSkeleton } from "@/components/skeletons";
import { REQUEST_STATUS, RequestStatusPill } from "@/components/status-pill";
import { formatDate, formatMoney } from "@/lib/format";
import { useOwnerSummary, usePlan } from "@/modules/plans/query-options";
import { useServiceRequest } from "../query-options";
import { isClosed } from "../service-requests.utils";
import { AssignPhotographerDialog } from "./assign-photographer-dialog";
import { RequestDecisionForm } from "./request-decision-form";
import { RequestDocuments } from "./request-documents";
import { RequestTimeline } from "./request-timeline";

export function ServiceRequestDetailView() {
  const { id } = useParams({ from: "/_protected/service-requests/$id" });
  const requestQ = useServiceRequest(id);

  return (
    <AsyncBoundary
      isLoading={requestQ.isPending}
      isError={requestQ.isError}
      error={requestQ.error}
      onReset={() => void requestQ.refetch()}
      loadingFallback={<DetailViewSkeleton />}
    >
      {requestQ.data && <RequestDetail detail={requestQ.data} />}
    </AsyncBoundary>
  );
}

function RequestDetail({
  detail: { request: r, documents },
}: {
  detail: ServiceRequestDetail;
}) {
  const ownerQ = useOwnerSummary(r.owner);
  const planQ = usePlan(r.plan);
  const [assigning, setAssigning] = useState(false);
  const plan = planQ.data;
  const owner = ownerQ.data;
  const name = r.coveredPersonSnapshot.fullName;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        crumbs={[
          { label: "Service requests", to: "/service-requests" },
          { label: name },
        ]}
        title={`${name}'s`}
        accent="service"
        badge={<RequestStatusPill status={r.status} />}
        actions={
          r.status === "Approved" && (
            <Button
              variant="accent"
              size="lg"
              onClick={() => setAssigning(true)}
            >
              <Camera />
              Assign photographer
            </Button>
          )
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title="Request details">
            <DetailGrid>
              <DetailItem label="Plan owner">
                {owner && (
                  <Link
                    to="/users/$id"
                    params={{ id: owner._id }}
                    className="hover:underline"
                  >
                    {owner.name}
                  </Link>
                )}
              </DetailItem>
              <DetailItem label="Plan">
                <Link
                  to="/plans/$id"
                  params={{ id: r.plan }}
                  className="hover:underline"
                >
                  {plan?.packageDetails.name ?? "View plan"}
                </Link>
              </DetailItem>
              <DetailItem label="Plan balance">
                {plan &&
                  formatMoney(plan.totalContributedAmount, plan.currency)}
              </DetailItem>
              <DetailItem label="Date of death">
                {formatDate(r.dateOfDeath)}
              </DetailItem>
              <DetailItem label="Expected service date">
                {formatDate(r.expectedServiceDate)}
              </DetailItem>
              <DetailItem label="Venue">{r.serviceLocation}</DetailItem>
              <DetailItem label="Contact on the day">
                {r.contactPerson}
                <span className="block text-xs font-normal text-muted-foreground">
                  {formatPhoneDisplay(r.contactPhone)}
                </span>
              </DetailItem>
              {r.photographerName && (
                <DetailItem label="Photographer">
                  {r.photographerName}
                  {r.photographerPhoneNo && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {formatPhoneDisplay(r.photographerPhoneNo)}
                    </span>
                  )}
                </DetailItem>
              )}
            </DetailGrid>
            {r.additionalInformation && (
              <p className="mt-5 rounded-xl bg-canvas px-4 py-3 text-sm italic text-ink-soft">
                &ldquo;{r.additionalInformation}&rdquo; — note from the
                requester
              </p>
            )}
          </SectionCard>

          <SectionCard title="Submitted documents">
            <div className="flex flex-col gap-6">
              <RequestDocuments request={r} documents={documents} />
              {!isClosed(r.status) && (
                <RequestDecisionForm
                  key={r.status}
                  request={r}
                  documents={documents}
                />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            tone="dark"
            title="Status"
            description={REQUEST_STATUS[r.status][0]}
          >
            {r.moreInfoReason && r.status === "More_Info_Required" && (
              <p className="rounded-xl bg-cream px-3 py-2 text-[13px] text-status-due">
                Asked the customer: {r.moreInfoReason}
              </p>
            )}
            {r.rejectionReason && r.status === "Rejected" && (
              <p className="rounded-xl bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">
                Reason given: {r.rejectionReason}
              </p>
            )}
          </SectionCard>
          <SectionCard title="Timeline">
            <RequestTimeline request={r} />
          </SectionCard>
        </div>
      </div>

      <AssignPhotographerDialog
        requestId={r._id}
        open={assigning}
        onOpenChange={setAssigning}
      />
    </main>
  );
}
