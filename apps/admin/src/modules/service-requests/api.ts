import {
  type AssignPhotographerInput,
  type DownloadUrlResponse,
  downloadUrlResponseSchema,
  type PaginatedAdminServiceRequests,
  paginatedAdminServiceRequestsSchema,
  type ServiceDocument,
  type ServiceRequest,
  type ServiceRequestDetail,
  type ServiceRequestQueryInput,
  serviceDocumentSchema,
  serviceRequestDetailSchema,
  serviceRequestSchema,
  type UpdateServiceRequestStatusInput,
  type VerifyDocumentInput,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchServiceRequestsParams = Partial<ServiceRequestQueryInput>;

export async function fetchServiceRequests(
  params?: FetchServiceRequestsParams,
): Promise<PaginatedAdminServiceRequests> {
  const res = await api<unknown>(
    `/service-requests/admin${toQueryString(params)}`,
  );
  return parseApiResponse(
    paginatedAdminServiceRequestsSchema,
    res,
    "Invalid service requests response from server",
  );
}

export async function fetchServiceRequest(
  id: string,
): Promise<ServiceRequestDetail> {
  const res = await api<unknown>(`/service-requests/${id}`);
  return parseApiResponse(
    serviceRequestDetailSchema,
    res,
    `Invalid service request (${id}) response from server`,
  );
}

export async function updateServiceRequestStatus(
  id: string,
  body: UpdateServiceRequestStatusInput,
): Promise<ServiceRequest> {
  const res = await api<unknown>(`/service-requests/${id}/status`, {
    method: "PATCH",
    body: { status: body.status, ...(body.reason && { reason: body.reason }) },
  });
  return parseApiResponse(
    serviceRequestSchema,
    res,
    "Invalid service request status response from server",
  );
}

export async function verifyDocument(
  id: string,
  documentId: string,
  body: VerifyDocumentInput,
): Promise<ServiceDocument> {
  const res = await api<unknown>(
    `/service-requests/${id}/documents/${documentId}/verify`,
    { method: "PATCH", body },
  );
  return parseApiResponse(
    serviceDocumentSchema,
    res,
    "Invalid document verification response from server",
  );
}

export async function fetchDocumentUrl(
  id: string,
  documentId: string,
): Promise<DownloadUrlResponse> {
  const res = await api<unknown>(
    `/service-requests/${id}/documents/${documentId}/download-url`,
  );
  return parseApiResponse(
    downloadUrlResponseSchema,
    res,
    "Invalid document link response from server",
  );
}

export async function assignPhotographer(
  id: string,
  body: AssignPhotographerInput,
): Promise<ServiceRequest> {
  const res = await api<unknown>(
    `/service-requests/${id}/assign-photographer`,
    {
      method: "PATCH",
      body: {
        photographerName: body.photographerName.trim(),
        photographerPhoneNo: body.photographerPhoneNo.trim(),
      },
    },
  );
  return parseApiResponse(
    serviceRequestSchema,
    res,
    "Invalid photographer assignment response from server",
  );
}
