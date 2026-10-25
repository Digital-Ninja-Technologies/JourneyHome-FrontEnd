import { api } from "@/lib/api";
import type { ServiceDocument, ServiceRequest } from "@/lib/types";
import type { ServiceRequestStatus } from "@journeyhome/schemas";

export async function fetchAllRequests(): Promise<ServiceRequest[]> {
  return api<ServiceRequest[]>("/service-requests/admin");
}

export async function fetchRequest(
  id: string,
): Promise<{ request: ServiceRequest; documents: ServiceDocument[] }> {
  return api<{ request: ServiceRequest; documents: ServiceDocument[] }>(
    `/service-requests/${id}`,
  );
}

export async function updateRequestStatus(
  id: string,
  status: ServiceRequestStatus,
  reason?: string,
): Promise<ServiceRequest> {
  return api<ServiceRequest>(`/service-requests/${id}/status`, {
    method: "PATCH",
    body: { status, ...(reason && { reason }) },
  });
}
