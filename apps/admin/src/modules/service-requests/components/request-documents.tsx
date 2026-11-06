import type { ServiceDocument, ServiceRequest } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { FileText } from "lucide-react";
import { useState } from "react";
import { DocumentStatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import {
  useOpenDocumentMutation,
  useVerifyDocumentMutation,
} from "../mutations";
import {
  canReviewDocuments,
  currentDocuments,
  DOCUMENT_LABEL,
} from "../service-requests.utils";
import { DocumentResubmitDialog } from "./document-resubmit-dialog";

export function RequestDocuments({
  request,
  documents,
}: {
  request: ServiceRequest;
  documents: ServiceDocument[];
}) {
  const open = useOpenDocumentMutation(request._id);
  const verify = useVerifyDocumentMutation(request._id);
  const [resubmit, setResubmit] = useState<ServiceDocument | null>(null);
  const docs = currentDocuments(documents);
  const reviewing = canReviewDocuments(request.status);

  if (docs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {docs.map((d) => (
          <li key={d._id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream text-status-due">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold">
                    {DOCUMENT_LABEL[d.documentType]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded {formatDate(d.uploadedAt)}
                    {d.rejectionReason ? ` · ${d.rejectionReason}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <DocumentStatusPill status={d.verificationStatus} />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-7 px-1 text-xs"
                  disabled={open.isPending && open.variables === d._id}
                  onClick={() => open.mutate(d._id)}
                >
                  View
                </Button>
                {reviewing && d.verificationStatus === "Pending" && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={verify.isPending}
                      onClick={() =>
                        verify.mutate({
                          documentId: d._id,
                          verificationStatus: "Approved",
                        })
                      }
                      className="h-7 rounded-lg bg-status-active px-3 text-xs text-white hover:bg-status-active/90"
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={verify.isPending}
                      onClick={() => setResubmit(d)}
                      className="h-7 rounded-lg border-status-cancelled px-3 text-xs text-status-cancelled"
                    >
                      Needs new copy
                    </Button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <DocumentResubmitDialog
        requestId={request._id}
        document={resubmit}
        onClose={() => setResubmit(null)}
      />
    </>
  );
}
