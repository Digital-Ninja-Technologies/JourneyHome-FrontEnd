import {
  type ServiceDocument,
  type ServiceRequest,
  type ServiceRequestQueryInput,
  serviceRequestDetailSchema,
  serviceRequestSchema,
} from "@journeyhome/schemas";
import { z } from "zod";
import { api, parseApiResponse } from "@/lib/api";

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
