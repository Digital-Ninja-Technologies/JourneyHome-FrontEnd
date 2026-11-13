import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AdminServiceRequestStatus,
  ServiceDocument,
  ServiceRequest,
} from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { FormTextarea } from "@journeyhome/ui/components/form-fields";
import { cn } from "@journeyhome/ui/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  useApproveRequestMutation,
  useUpdateRequestStatusMutation,
} from "../mutations";
import {
  approvalReadiness,
  availableDecisions,
  currentDocuments,
  DECISION_LABEL,
  type DecisionFormValues,
  DOCUMENT_LABEL,
  decisionFormSchema,
} from "../service-requests.utils";

const TONE: Partial<Record<AdminServiceRequestStatus, string>> = {
  Approved: "bg-status-active text-white hover:bg-status-active/90",
  Docs_Verified: "bg-status-active text-white hover:bg-status-active/90",
  More_Info_Required: "border-link text-link",
  Rejected: "border-status-cancelled text-status-cancelled",
  Cancelled: "border-status-cancelled text-status-cancelled",
};
const OUTLINED = new Set<AdminServiceRequestStatus>([
  "More_Info_Required",
  "Rejected",
  "Cancelled",
]);

/** One message box, one button per allowed decision. */
export function RequestDecisionForm({
  request,
  documents,
}: {
  request: ServiceRequest;
  documents: ServiceDocument[];
}) {
  const update = useUpdateRequestStatusMutation(request._id);
  const approve = useApproveRequestMutation(request._id);
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const decisions = availableDecisions(request.status);
  const docs = currentDocuments(documents);
  const allApproved =
    docs.length > 0 && docs.every((d) => d.verificationStatus === "Approved");
  const readiness = approvalReadiness(documents);
  const pendingDocs = readiness.ok ? readiness.pending : [];
  const isSaving = update.isPending || approve.isPending;

  const { control, handleSubmit, setValue, reset, watch } =
    useForm<DecisionFormValues>({
      resolver: zodResolver(decisionFormSchema),
      defaultValues: { status: decisions[0] ?? "Under_Review", reason: "" },
    });
  const pendingStatus = isSaving ? watch("status") : undefined;

  if (decisions.length === 0) return null;

  const runApproval = () =>
    void handleSubmit((values) =>
      approve.mutate(
        {
          pendingDocumentIds: pendingDocs.map((d) => d._id),
          reason: values.reason || undefined,
        },
        {
          onSuccess: () => reset({ status: "Approved", reason: "" }),
          onSettled: () => setConfirmingApproval(false),
        },
      ),
    )();

  const submitWith = (status: AdminServiceRequestStatus) => {
    setValue("status", status);
    if (status === "Approved") {
      // Pending documents get approved with the request, so say so first.
      if (pendingDocs.length > 0) setConfirmingApproval(true);
      else runApproval();
      return;
    }
    void handleSubmit((values) =>
      update.mutate(
        { status: values.status, reason: values.reason || undefined },
        { onSuccess: () => reset({ status: values.status, reason: "" }) },
      ),
    )();
  };

  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-3 border-t border-border pt-5"
    >
      <FormTextarea
        control={control}
        name="reason"
        label="Message to the customer"
        description="Required to request more info or reject. Sent with every decision."
        rows={3}
        placeholder="e.g. Please upload a clearer death certificate."
      />
      <div className="flex flex-wrap gap-2">
        {decisions.map((status) => {
          const blockedReason =
            status === "Docs_Verified" && !allApproved
              ? "Approve every document first"
              : status === "Approved" && !readiness.ok
                ? readiness.reason
                : undefined;
          return (
            <Button
              key={status}
              type="button"
              variant={OUTLINED.has(status) ? "outline" : "default"}
              disabled={isSaving || Boolean(blockedReason)}
              title={blockedReason}
              onClick={() => submitWith(status)}
              className={cn("h-11 rounded-xl px-5 font-bold", TONE[status])}
            >
              {pendingStatus === status ? "Saving…" : DECISION_LABEL[status]}
            </Button>
          );
        })}
      </div>
      {decisions.includes("Approved") && !readiness.ok && (
        <p className="text-xs text-muted-foreground">
          Can&rsquo;t approve yet: {readiness.reason}
        </p>
      )}

      <ConfirmDialog
        open={confirmingApproval}
        onOpenChange={setConfirmingApproval}
        title="Approve the documents too?"
        description={`${
          pendingDocs.length === 1
            ? "This document hasn't been reviewed yet"
            : `These ${pendingDocs.length} documents haven't been reviewed yet`
        }: ${pendingDocs
          .map((d) => DOCUMENT_LABEL[d.documentType])
          .join(", ")}. Approving the request will approve ${
          pendingDocs.length === 1 ? "it" : "them"
        } as well.`}
        confirmLabel="Approve documents and request"
        isPending={approve.isPending}
        onConfirm={runApproval}
      />
    </form>
  );
}
