import { zodResolver } from "@hookform/resolvers/zod";
import type { ServiceDocument } from "@journeyhome/schemas";
import { FormTextarea } from "@journeyhome/ui/components/form-fields";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/form-dialog";
import { useVerifyDocumentMutation } from "../mutations";
import {
  DOCUMENT_LABEL,
  type ResubmitDocumentValues,
  resubmitDocumentSchema,
} from "../service-requests.utils";

const FORM_ID = "document-resubmit-form";

export function DocumentResubmitDialog({
  requestId,
  document,
  onClose,
}: {
  requestId: string;
  document: ServiceDocument | null;
  onClose: () => void;
}) {
  const verify = useVerifyDocumentMutation(requestId);
  const { control, handleSubmit, reset } = useForm<ResubmitDocumentValues>({
    resolver: zodResolver(resubmitDocumentSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (!document) reset({ reason: "" });
  }, [document, reset]);

  return (
    <FormDialog
      open={Boolean(document)}
      onOpenChange={(open) => !open && onClose()}
      title="Ask for a new copy"
      description={
        document
          ? `The customer will be asked to re-upload their ${DOCUMENT_LABEL[document.documentType].toLowerCase()}.`
          : undefined
      }
      formId={FORM_ID}
      submitLabel="Send request"
      pendingLabel="Sending…"
      isPending={verify.isPending}
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={handleSubmit(({ reason }) => {
          if (!document) return;
          verify.mutate(
            {
              documentId: document._id,
              verificationStatus: "Requires_Resubmission",
              reason,
            },
            { onSuccess: onClose },
          );
        })}
      >
        <FormTextarea
          control={control}
          name="reason"
          label="What's wrong with it?"
          description="Shown to the customer."
          rows={4}
          placeholder="e.g. The scan is blurry and the name isn't readable."
        />
      </form>
    </FormDialog>
  );
}
