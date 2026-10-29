import { Button } from "@journeyhome/ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardTitle,
  Eyebrow,
  Field,
  PageHeader,
  Pill,
  QueryError,
  type Tone,
} from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { useAllPlans, useDirectory, useRequest } from "@/lib/queries";
import { REQUEST_STATUS } from "@/lib/status";
import type { ServiceDocument } from "@/lib/types";

const DOC_LABEL = {
  Death_Certificate: "Death certificate",
  Valid_Identification: "Valid ID of the deceased",
  Other_Proof: "Other proof",
};
const DOC_STATUS: Record<
  ServiceDocument["verificationStatus"],
  [string, Tone]
> = {
  Pending: ["Awaiting review", "due"],
  Approved: ["Approved", "active"],
  Requires_Resubmission: ["New copy requested", "cancelled"],
};

export default function ServiceRequestDetail() {
  const { id } = useParams({
    from: "/_protected/service-requests/$id",
  });
  const q = useRequest(id);
  const plansQ = useAllPlans();
  const dir = useDirectory();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [docReason, setDocReason] = useState<{
    id: string;
    text: string;
  } | null>(null);

  const act = useMutation({
    mutationFn: ({
      path,
      method = "POST",
      body,
    }: {
      path: string;
      method?: string;
      body?: unknown;
    }) => api(`/service-requests/${id}${path}`, { method, body }),
    onSuccess: () => {
      setReason("");
      setDocReason(null);
      for (const key of ["request", "requests", "plans", "plan"])
        void queryClient.invalidateQueries({ queryKey: [key] });
    },
  });

  const open = useMutation({
    mutationFn: async (docId: string) => {
      const { url } = await api<{ url: string }>(
        `/service-requests/${id}/documents/${docId}/download-url`,
      );
      window.open(url, "_blank", "noopener");
    },
  });

  if (q.isPending)
    return <main className="p-4 sm:p-6 md:p-10 text-muted">Loading request…</main>;
  if (q.isError)
    return (
      <main className="p-4 sm:p-6 md:p-10">
        <QueryError error={q.error} retry={() => void q.refetch()} />
      </main>
    );

  const { request: r, documents } = q.data;
  const [label, tone] = REQUEST_STATUS[r.status];
  const plan = plansQ.data?.find((p) => p._id === r.plan);
  const docs = documents.filter((d) => !d.replacedBy);
  const allApproved =
    docs.length > 0 && docs.every((d) => d.verificationStatus === "Approved");
  const trimmed = reason.trim();
  const busy = act.isPending;
  const closed =
    r.status === "Approved" ||
    r.status === "Rejected" ||
    r.status === "Cancelled";
  const canDecide =
    r.status === "Under_Review" ||
    r.status === "Docs_Verified" ||
    r.status === "More_Info_Required";

  const btn = "h-11 rounded-xl px-5 text-sm font-bold disabled:opacity-50";
  const timeline = [
    ["Submitted", r.createdAt, ""],
    ...(r.verifiedAt ? [["Documents verified", r.verifiedAt, ""]] : []),
    ...(r.approvedAt ? [["Approved", r.approvedAt, ""]] : []),
    ...(r.rejectedAt
      ? [["Rejected", r.rejectedAt, r.rejectionReason ?? ""]]
      : []),
  ];

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <PageHeader
          crumb={
            <>
              <Link to="/service-requests" className="hover:underline">
                Service requests
              </Link>{" "}
              / {r.coveredPersonSnapshot.fullName}
            </>
          }
          title={`${r.coveredPersonSnapshot.fullName}'s service`}
        />
        <Pill label={label} tone={tone} className="mt-5" />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle className="mb-5">Request details</CardTitle>
            <div className="grid gap-6 sm:grid-cols-3">
              <Field label="Plan owner">
                <Link
                  to="/users/$id"
                  params={{ id: r.owner }}
                  className="hover:underline"
                >
                  {dir.nameOf(r.owner)}
                </Link>
              </Field>
              <Field label="Covered person">
                {r.coveredPersonSnapshot.fullName}
                {plan ? ` · ${plan.packageSnapshot.name}` : ""}
              </Field>
              <Field label="Date of death">{formatDate(r.dateOfDeath)}</Field>
              <Field label="Expected service date">
                {formatDate(r.expectedBurialDate)}
              </Field>
              <Field label="Venue">{r.burialLocation}</Field>
              <Field label="Plan balance">
                {plan
                  ? formatMoney(plan.totalContributedMinor, plan.currency)
                  : undefined}
              </Field>
              <Field label="Contact on the day">
                {r.contactPerson} · {r.contactPhone}
              </Field>
            </div>
            {r.additionalInformation && (
              <p className="mt-5 rounded-xl bg-canvas px-4 py-3 text-sm italic text-ink-soft">
                &ldquo;{r.additionalInformation}&rdquo; — note from requester
              </p>
            )}
          </Card>

          <Card>
            <CardTitle className="mb-4">Submitted documents</CardTitle>
            {docs.length === 0 && (
              <p className="text-sm text-muted">No documents uploaded yet.</p>
            )}
            <div className="flex flex-col gap-3">
              {docs.map((d) => {
                const [dl, dt] = DOC_STATUS[d.verificationStatus];
                const reviewing =
                  r.status === "Under_Review" ||
                  r.status === "More_Info_Required";
                return (
                  <div
                    key={d._id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-cream text-status-due">
                          <FileText className="size-5" />
                        </span>
                        <div>
                          <div className="text-sm font-bold">
                            {DOC_LABEL[d.documentType]}
                          </div>
                          <div className="text-xs text-muted">
                            Uploaded {formatDate(d.uploadedAt)}
                            {d.rejectionReason ? ` · ${d.rejectionReason}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="text-xs font-semibold text-link underline"
                          onClick={() => open.mutate(d._id)}
                        >
                          View
                        </button>
                        <Pill label={dl} tone={dt} />
                        {reviewing && d.verificationStatus === "Pending" && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() =>
                                act.mutate({
                                  path: `/documents/${d._id}/verify`,
                                  method: "PATCH",
                                  body: { verificationStatus: "Approved" },
                                })
                              }
                              className="rounded-lg bg-status-active px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={busy}
                              onClick={() =>
                                setDocReason({ id: d._id, text: "" })
                              }
                              className="rounded-lg border border-status-cancelled px-3 py-1.5 text-xs font-bold text-status-cancelled"
                            >
                              Needs new copy
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {docReason?.id === d._id && (
                      <form
                        className="mt-3 flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          act.mutate({
                            path: `/documents/${d._id}/verify`,
                            method: "PATCH",
                            body: {
                              verificationStatus: "Requires_Resubmission",
                              reason: docReason.text.trim(),
                            },
                          });
                        }}
                      >
                        <input
                          required
                          value={docReason.text}
                          onChange={(e) =>
                            setDocReason({ id: d._id, text: e.target.value })
                          }
                          placeholder="Why does this need a new copy? (shown to the customer)"
                          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={busy || !docReason.text.trim()}
                        >
                          Send
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setDocReason(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>

            {!closed && (
              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
                <Eyebrow>Decision</Eyebrow>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Message to the customer — required to request more info or reject…"
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-accent"
                />
                <div className="flex flex-wrap gap-3">
                  {r.status === "Submitted" && (
                    <Button
                      disabled={busy}
                      onClick={() => act.mutate({ path: "/under-review" })}
                      className={btn}
                    >
                      Start review
                    </Button>
                  )}
                  {canDecide && r.status !== "Docs_Verified" && (
                    <Button
                      disabled={busy || !allApproved}
                      title={
                        allApproved ? undefined : "Approve every document first"
                      }
                      onClick={() => act.mutate({ path: "/docs-verified" })}
                      className={`${btn} bg-status-active text-white hover:bg-status-active/90`}
                    >
                      Mark documents verified
                    </Button>
                  )}
                  {canDecide && (
                    <Button
                      disabled={busy}
                      onClick={() => act.mutate({ path: "/approve" })}
                      className={`${btn} bg-status-active text-white hover:bg-status-active/90`}
                    >
                      Approve request
                    </Button>
                  )}
                  {canDecide && (
                    <Button
                      variant="outline"
                      disabled={busy || trimmed.length < 3}
                      onClick={() =>
                        act.mutate({
                          path: "/request-more-info",
                          body: { reason: trimmed },
                        })
                      }
                      className={`${btn} border-link text-link`}
                    >
                      Request more info
                    </Button>
                  )}
                  {canDecide && (
                    <Button
                      variant="outline"
                      disabled={busy || trimmed.length < 3}
                      onClick={() =>
                        act.mutate({
                          path: "/reject",
                          body: { reason: trimmed },
                        })
                      }
                      className={`${btn} border-status-cancelled text-status-cancelled`}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            )}
            {(act.isError || open.isError) && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
              >
                {(act.error ?? open.error)?.message}
              </p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="bg-foreground text-canvas">
            <CardTitle className="mb-3 text-canvas">Status</CardTitle>
            <div className="text-sm text-canvas/80">{label}</div>
            {r.moreInfoReason && r.status === "More_Info_Required" && (
              <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-[13px] text-status-due">
                Asked the customer: {r.moreInfoReason}
              </p>
            )}
            {r.rejectionReason && r.status === "Rejected" && (
              <p className="mt-3 rounded-xl bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">
                Reason given: {r.rejectionReason}
              </p>
            )}
          </Card>
          <Card>
            <CardTitle className="mb-3">Timeline</CardTitle>
            {timeline.map(([what, when, note]) => (
              <p key={what} className="mb-2 text-[13px] text-ink-soft">
                {formatDateTime(when)} — {what}
                {note ? ` (${note})` : ""}
              </p>
            ))}
          </Card>
        </div>
      </div>
    </main>
  );
}
