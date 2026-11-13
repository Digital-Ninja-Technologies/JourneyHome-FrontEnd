import type {
  AssignPhotographerInput,
  UpdateServiceRequestStatusInput,
  VerifyDocumentInput,
} from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { REQUEST_STATUS } from "@/components/status-pill";
import {
  assignPhotographer,
  fetchDocumentUrl,
  updateServiceRequestStatus,
  verifyDocument,
} from "./api";

/** Request changes ripple into plan statuses and the overview counts. */
function invalidate(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["service-requests"] });
  void queryClient.invalidateQueries({ queryKey: ["plans"] });
  void queryClient.invalidateQueries({ queryKey: ["overview"] });
  void queryClient.invalidateQueries({ queryKey: ["users"] });
}

const onError = (title: string) => (error: Error) =>
  toast.add({ type: "error", title, description: error.message });

export function useUpdateRequestStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateServiceRequestStatusInput) =>
      updateServiceRequestStatus(id, body),
    onSuccess: (request) => {
      invalidate(queryClient);
      toast.add({
        type: "success",
        title: "Request updated",
        description: `Now ${REQUEST_STATUS[request.status][0].toLowerCase()}. The customer has been notified.`,
      });
    },
    onError: onError("Couldn't update the request"),
  });
}

export function useVerifyDocumentMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      ...body
    }: VerifyDocumentInput & { documentId: string }) =>
      verifyDocument(id, documentId, body),
    onSuccess: (doc) => {
      invalidate(queryClient);
      toast.add({
        type: "success",
        title:
          doc.verificationStatus === "Approved"
            ? "Document approved"
            : "New copy requested",
      });
    },
    onError: onError("Couldn't update the document"),
  });
}

export function useOpenDocumentMutation(id: string) {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { url } = await fetchDocumentUrl(id, documentId);
      window.open(url, "_blank", "noopener");
    },
    onError: onError("Couldn't open the document"),
  });
}

/**
 * Approves the request, first approving any documents still pending.
 * Documents go one at a time so a failure stops before the request is approved.
 */
export function useApproveRequestMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pendingDocumentIds,
      reason,
    }: {
      pendingDocumentIds: string[];
      reason?: string;
    }) => {
      for (const documentId of pendingDocumentIds) {
        await verifyDocument(id, documentId, {
          verificationStatus: "Approved",
        });
      }
      return updateServiceRequestStatus(id, { status: "Approved", reason });
    },
    onSuccess: (_request, { pendingDocumentIds }) => {
      toast.add({
        type: "success",
        title: "Request approved",
        description:
          pendingDocumentIds.length > 0
            ? `${pendingDocumentIds.length} pending document${pendingDocumentIds.length === 1 ? " was" : "s were"} approved too. The customer has been notified.`
            : "The customer has been notified.",
      });
    },
    onError: onError("Couldn't approve the request"),
    // Refetch even on failure: some documents may have been approved already.
    onSettled: () => invalidate(queryClient),
  });
}

export function useAssignPhotographerMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignPhotographerInput) => assignPhotographer(id, body),
    onSuccess: (request) => {
      invalidate(queryClient);
      toast.add({
        type: "success",
        title: "Photographer assigned",
        description: `${request.photographerName} is booked and the request is closed.`,
      });
    },
    onError: onError("Couldn't assign the photographer"),
  });
}
