import { api } from "@/lib/api";
import type { ServiceDocument, ServiceRequest } from "@/lib/types";

export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  return api<ServiceRequest[]>("/service-requests");
}

export async function fetchServiceRequest(
  id: string,
): Promise<{ request: ServiceRequest; documents: ServiceDocument[] }> {
  return api<{ request: ServiceRequest; documents: ServiceDocument[] }>(
    `/service-requests/${id}`,
  );
}

export async function createServiceRequest(
  data: unknown,
): Promise<ServiceRequest> {
  return api<ServiceRequest>("/service-requests", { body: data });
}
