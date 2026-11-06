import { zodResolver } from "@hookform/resolvers/zod";
import type {
  AdminServiceRequestStatus,
  ServiceDocument,
  ServiceRequest,
} from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { FormTextarea } from "@journeyhome/ui/components/form-fields";
import { cn } from "@journeyhome/ui/lib/utils";
import { useForm } from "react-hook-form";
import { useUpdateRequestStatusMutation } from "../mutations";
import {
  availableDecisions,
  currentDocuments,
  DECISION_LABEL,
  type DecisionFormValues,
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
  const decisions = availableDecisions(request.status);
  const docs = currentDocuments(documents);
  const allApproved =
    docs.length > 0 && docs.every((d) => d.verificationStatus === "Approved");

  const { control, handleSubmit, setValue, reset, watch } =
    useForm<DecisionFormValues>({
      resolver: zodResolver(decisionFormSchema),
      defaultValues: { status: decisions[0] ?? "Under_Review", reason: "" },
    });
  const pendingStatus = update.isPending ? watch("status") : undefined;

  if (decisions.length === 0) return null;

  const submitWith = (status: AdminServiceRequestStatus) => {
    setValue("status", status);
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
          const blocked = status === "Docs_Verified" && !allApproved;
          return (
            <Button
              key={status}
              type="button"
              variant={OUTLINED.has(status) ? "outline" : "default"}
              disabled={update.isPending || blocked}
              title={blocked ? "Approve every document first" : undefined}
              onClick={() => submitWith(status)}
              className={cn("h-11 rounded-xl px-5 font-bold", TONE[status])}
            >
              {pendingStatus === status ? "Saving…" : DECISION_LABEL[status]}
            </Button>
          );
        })}
      </div>
    </form>
  );
}
