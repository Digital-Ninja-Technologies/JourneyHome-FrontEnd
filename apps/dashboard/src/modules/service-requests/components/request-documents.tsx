import type { DocumentType, ServiceDocument } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { Pill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import {
  openServiceDocument,
  serviceDocumentUpload,
} from "@/modules/service-requests/api";
import {
  currentDocuments,
  DOC_ACCEPT,
  DOC_HINT,
  DOC_LABEL,
  DOC_MAX_BYTES,
  DOC_STATUS_LABEL,
  DOC_STATUS_TONE,
  documentTypes,
} from "@/modules/service-requests/service-requests.utils";
import { FileUploadArea } from "@/modules/storage/components/file-upload-area";
import { useFileUpload } from "@/modules/storage/hooks/use-file-upload";

/** Stage a file, then upload it as a new document (or as the replacement for a flagged one). */
function DocumentUpload({
  requestId,
  type,
  replacesId,
}: {
  requestId: string;
  type: DocumentType;
  replacesId?: string;
}) {
  const queryClient = useQueryClient();
  const { uploadFile, isUploading, progress } = useFileUpload();
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: (f: File) =>
      uploadFile(f, serviceDocumentUpload(requestId, type, replacesId)),
    onSuccess: () => {
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ["service-request"] });
      void queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast.add({
        type: "success",
        title: "Document uploaded",
        description: `Your ${DOC_LABEL[type].toLowerCase()} was uploaded and is awaiting review.`,
      });
    },
    // The upload hook has already shown the failure toast.
  });

  return (
    <div className="flex flex-col gap-3">
      <FileUploadArea
        label={replacesId ? "Upload a new copy" : "Upload document"}
        accept={DOC_ACCEPT}
        maxSize={DOC_MAX_BYTES}
        hint={DOC_HINT}
        value={file}
        onChange={setFile}
        isUploading={isUploading}
        progress={progress}
      />
      {file && (
        <Button
          type="button"
          disabled={upload.isPending}
          onClick={() => upload.mutate(file)}
          className="h-11 rounded-xl text-sm font-bold"
        >
          {upload.isPending ? `Uploading (${progress}%)` : "Upload"}
        </Button>
      )}
    </div>
  );
}

/** Every document the request needs, with its review status and, where allowed, a way to upload or replace it. */
export function RequestDocuments({
  requestId,
  documents,
  canUpload,
}: {
  requestId: string;
  documents: ServiceDocument[];
  canUpload: boolean;
}) {
  const current = currentDocuments(documents);

  const open = useMutation({
    mutationFn: (documentId: string) =>
      openServiceDocument(requestId, documentId),
    onError: (e: Error) =>
      toast.add({
        type: "error",
        title: "Couldn't open document",
        description: e.message,
      }),
  });

  return (
    <ul className="flex flex-col gap-3">
      {documentTypes(current).map((type) => {
        const doc = current.get(type);
        const resubmit = doc?.verificationStatus === "Requires_Resubmission";
        const needsFile = canUpload && (!doc || resubmit);

        return (
          <li
            key={type}
            className={cn(
              "flex flex-col gap-4 rounded-2xl border p-4 sm:p-5",
              resubmit ? "border-status-due/40 bg-cream/40" : "border-border",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{DOC_LABEL[type]}</div>
                  <div className="text-xs text-muted-foreground">
                    {doc
                      ? `Uploaded ${formatDate(doc.uploadedAt)}`
                      : "Not uploaded yet"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {doc && (
                  <Pill
                    label={DOC_STATUS_LABEL[doc.verificationStatus]}
                    tone={DOC_STATUS_TONE[doc.verificationStatus]}
                  />
                )}
                {doc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={open.isPending}
                    onClick={() => open.mutate(doc._id)}
                    className="gap-1.5 font-semibold text-link"
                  >
                    View
                    <ExternalLink className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {resubmit && (
              <div className="flex items-start gap-2.5 rounded-xl bg-cream px-4 py-3 text-[13px] leading-relaxed text-status-due">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <span className="font-bold">
                    This document needs a new copy.
                  </span>{" "}
                  {doc?.rejectionReason ?? "Please upload a clearer copy."}
                </div>
              </div>
            )}

            {needsFile && (
              <DocumentUpload
                requestId={requestId}
                type={type}
                replacesId={doc?._id}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
