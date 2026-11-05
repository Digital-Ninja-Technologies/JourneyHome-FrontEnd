import type { DocumentType, ServiceDocument } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ServiceDocumentsSkeleton } from "@/components/skeletons";
import { Pill } from "@/components/status-pill";
import { formatDay } from "@/lib/format";
import { useServiceRequest } from "@/modules/service-requests/query-options";
import {
  DOC_LABEL,
  openServiceDocument,
  REQUIRED_DOCS,
  uploadServiceDocument,
  validateFile,
} from "@/modules/service-requests/service-requests.utils";

const TONE = {
  Pending: "review",
  Approved: "active",
  Requires_Resubmission: "due",
} as const;
const LABEL = {
  Pending: "Awaiting review",
  Approved: "Approved",
  Requires_Resubmission: "Needs a new copy",
} as const;

/** Lists the request's documents and lets the customer upload missing ones or replace flagged ones. */
export function RequestDocuments({
  requestId,
  canUpload,
}: {
  requestId: string;
  canUpload: boolean;
}) {
  const q = useServiceRequest(requestId);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<{ type: DocumentType; replaces?: string } | null>(
    null,
  );
  const input = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: ({
      file,
      type,
      replaces,
    }: {
      file: File;
      type: DocumentType;
      replaces?: string;
    }) => uploadServiceDocument(requestId, file, type, replaces),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["service-request"] });
      void queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast.add({
        type: "success",
        title: "Document uploaded",
        description: "Your document was uploaded successfully.",
      });
    },
    onError: (e: Error) => {
      setError(e.message);
      toast.add({
        type: "error",
        title: "Upload failed",
        description: e.message || "Failed to upload document.",
      });
    },
  });

  const open = useMutation({
    mutationFn: (id: string) => openServiceDocument(requestId, id),
    onError: (e: Error) => {
      setError(e.message);
      toast.add({
        type: "error",
        title: "Could not open document",
        description: e.message,
      });
    },
  });

  if (q.isPending) return <ServiceDocumentsSkeleton />;
  if (q.isError)
    return (
      <p className="text-sm text-status-cancelled">
        Couldn&rsquo;t load documents. {q.error.message}
      </p>
    );

  // Replaced documents are history; show only the current one of each type.
  const current = q.data.documents.filter((d) => !d.replacedBy);
  const byType = new Map<DocumentType, ServiceDocument>(
    current.map((d) => [d.documentType, d]),
  );
  const types = [
    ...new Set<DocumentType>([
      ...REQUIRED_DOCS,
      ...current.map((d) => d.documentType),
    ]),
  ];

  function choose(type: DocumentType, replaces?: string) {
    pending.current = { type, replaces };
    input.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !pending.current) return;
    const problem = validateFile(file);
    if (problem) return setError(problem);
    upload.mutate({ file, ...pending.current });
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={input}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={onFile}
      />
      {types.map((type) => {
        const doc = byType.get(type);
        const resubmit = doc?.verificationStatus === "Requires_Resubmission";
        return (
          <div
            key={type}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3.5 first:border-t-0"
          >
            <div>
              <div className="text-sm font-semibold">{DOC_LABEL[type]}</div>
              <div className="text-xs text-muted-foreground">
                {doc
                  ? `Uploaded ${formatDay(doc.uploadedAt)}`
                  : "Not uploaded yet"}
                {resubmit && doc?.rejectionReason
                  ? ` · ${doc.rejectionReason}`
                  : ""}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {doc && (
                <Pill
                  label={LABEL[doc.verificationStatus]}
                  tone={TONE[doc.verificationStatus]}
                />
              )}
              {doc && (
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  className="h-auto p-0 font-semibold text-link underline"
                  onClick={() => open.mutate(doc._id)}
                >
                  View
                </Button>
              )}
              {canUpload && (!doc || resubmit) && (
                <Button
                  type="button"
                  size="sm"
                  disabled={upload.isPending}
                  onClick={() => choose(type, doc?._id)}
                  className="h-9 rounded-xl px-4 text-xs font-bold"
                >
                  {upload.isPending
                    ? "Uploading…"
                    : doc
                      ? "Upload replacement"
                      : "Upload"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
        >
          {error}
        </p>
      )}
    </div>
  );
}
