import {
  type ServiceDocument,
  type ServiceRequest,
  serviceRequestDetailSchema,
  serviceRequestSchema,
  serviceRequestsListResponseSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse } from "@/lib/api";

export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  const res = await api<unknown>("/service-requests");
  return parseApiResponse(
    serviceRequestsListResponseSchema,
    res,
    "Invalid service requests response from server",
  );
}

export async function fetchServiceRequest(
  id: string,
): Promise<{ request: ServiceRequest; documents: ServiceDocument[] }> {
  const res = await api<unknown>(`/service-requests/${id}`);
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
