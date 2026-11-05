import {
  type DocumentType,
  downloadUrlResponseSchema,
  type ServiceDocument,
  type ServiceRequest,
  type ServiceRequestQueryInput,
  serviceDocumentSchema,
  serviceRequestDetailSchema,
  serviceRequestSchema,
  uploadUrlResponseSchema,
} from "@journeyhome/schemas";
import { z } from "zod";
import { api, parseApiResponse } from "@/lib/api";
import type { UploadTarget } from "@/modules/storage/api";

const serviceRequestsListSchema = z.array(serviceRequestSchema);

export async function fetchServiceRequests(
  _params?: ServiceRequestQueryInput,
): Promise<ServiceRequest[]> {
  const res = await api<unknown>("/service-requests");
  return parseApiResponse(
    serviceRequestsListSchema,
    res,
    "Invalid service requests response from server",
  );
}

export async function fetchServiceRequest(
  id: string,
): Promise<{ request: ServiceRequest; documents: ServiceDocument[] }> {
  const res = await api<unknown>(`/service-requests/${encodeURIComponent(id)}`);
  return parseApiResponse(
    serviceRequestDetailSchema,
    res,
    `Invalid service request (${id}) response from server`,
  );
}

export async function createServiceRequest(
  data: unknown,
): Promise<ServiceRequest> {
  const res = await api<unknown>("/service-requests", { body: data });
  return parseApiResponse(
    serviceRequestSchema,
    res,
    "Invalid created service request response from server",
  );
}

/**
 * Where a service document goes: `POST .../documents/upload-url` for the presigned PUT URL, then
 * `POST .../documents/complete` to register it (optionally replacing a document that was flagged).
 */
export function serviceDocumentUpload(
  requestId: string,
  documentType: DocumentType,
  replacesDocumentId?: string,
): UploadTarget<ServiceDocument> {
  const base = `/service-requests/${encodeURIComponent(requestId)}/documents`;
  return {
    presign: async (file) =>
      parseApiResponse(
        uploadUrlResponseSchema,
        await api<unknown>(`${base}/upload-url`, {
          body: { documentType, ...file },
        }),
        "Invalid upload URL response from server",
      ),
    complete: async ({ fileId, uploadToken }) =>
      parseApiResponse(
        serviceDocumentSchema,
        await api<unknown>(`${base}/complete`, {
          body: {
            fileId,
            uploadToken,
            documentType,
            ...(replacesDocumentId && { replacesDocumentId }),
          },
        }),
        "Invalid uploaded document response from server",
      ),
  };
}

export async function fetchDocumentDownloadUrl(
  requestId: string,
  documentId: string,
): Promise<string> {
  const res = await api<unknown>(
    `/service-requests/${encodeURIComponent(requestId)}/documents/${encodeURIComponent(documentId)}/download-url`,
  );
  return parseApiResponse(
    downloadUrlResponseSchema,
    res,
    "Invalid document download response from server",
  ).url;
}

/**
 * Opens a private document in a new tab. The tab is opened up-front (inside the click) and pointed
 * at the signed URL once it arrives, so popup blockers don't swallow the async `window.open`.
 */
export async function openServiceDocument(
  requestId: string,
  documentId: string,
) {
  const tab = window.open("about:blank", "_blank");
  if (tab) tab.opener = null;
  try {
    const url = await fetchDocumentDownloadUrl(requestId, documentId);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener");
  } catch (error) {
    tab?.close();
    throw error;
  }
}
