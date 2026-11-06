import { z } from "zod";
import {
  DocumentTypeEnum,
  DocumentVerificationStatusEnum,
  ServiceRequestStatusEnum,
} from "./enums";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";
import { coveredPersonSchema } from "./plan";
import { userSummarySchema } from "./user";

/**
 * Service document schema.
 * Aligned with OpenAPI components.schemas.ServiceDocument.
 */
export const serviceDocumentSchema = z.object({
  _id: z.string(),
  serviceRequest: z.string(),
  owner: z.string(),
  plan: z.string(),
  file: z.string(),
  documentType: DocumentTypeEnum,
  verificationStatus: DocumentVerificationStatusEnum,
  uploadedAt: z.string(),
  verifiedAt: z.string().nullable().optional(),
  verifiedBy: z.string().nullable().optional(),
  rejectionReason: z.string().optional(),
  replacedBy: z.string().optional(),
  url: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});
export type ServiceDocument = z.infer<typeof serviceDocumentSchema>;

/**
 * Base service request fields shared by customer and admin shapes.
 * Aligned with OpenAPI components.schemas.ServiceRequestBase.
 */
export const serviceRequestBaseSchema = z.object({
  _id: z.string(),
  coveredPersonSnapshot: coveredPersonSchema,
  dateOfDeath: z.string(),
  serviceLocation: z.string(),
  expectedServiceDate: z.string(),
  contactPerson: z.string(),
  contactPhone: z.string(),
  additionalInformation: z.string().optional(),
  reason: z.string().optional(),
  rejectionReason: z.string().optional(),
  moreInfoReason: z.string().optional(),
  status: ServiceRequestStatusEnum,
  documents: z.array(serviceDocumentSchema).default([]),
  reviewedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  photographerName: z.string().optional(),
  photographerAssignedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
});

/**
 * Customer service request with owner and plan as string IDs.
 * Aligned with OpenAPI components.schemas.ServiceRequest.
 */
export const serviceRequestSchema = serviceRequestBaseSchema.extend({
  owner: z.string(),
  plan: z.string(),
});
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;

/**
 * Detailed service request response containing request and its documents.
 * Aligned with OpenAPI components.schemas.ServiceRequestDetailResponse data shape.
 */
export const serviceRequestDetailSchema = z.object({
  request: serviceRequestSchema,
  documents: z.array(serviceDocumentSchema),
});
export type ServiceRequestDetail = z.infer<typeof serviceRequestDetailSchema>;

/**
 * Admin service request with populated owner and plan.
 * Aligned with OpenAPI components.schemas.AdminServiceRequest.
 */
export const adminServiceRequestSchema = serviceRequestBaseSchema.extend({
  owner: userSummarySchema,
  plan: z.object({
    _id: z.string(),
    packageDetails: z
      .object({
        name: z.string(),
      })
      .optional(),
  }),
});
export type AdminServiceRequest = z.infer<typeof adminServiceRequestSchema>;

/**
 * Input schema for submitting a new service request (`POST /service-requests`).
 */
export const createServiceRequestSchema = z.object({
  planId: z.string().min(1, "Plan is required"),
  dateOfDeath: z.string().min(1, "Date of death is required"),
  serviceLocation: z.string().trim().min(1, "Service location is required"),
  expectedServiceDate: z.string().min(1, "Expected service date is required"),
  contactPerson: z.string().trim().min(1, "Contact person is required"),
  contactPhone: z.string().trim().min(1, "Contact phone is required"),
  additionalInformation: z.string().optional(),
});
export type CreateServiceRequestInput = z.infer<
  typeof createServiceRequestSchema
>;

/**
 * Presigned upload URL payload returned by `POST /service-requests/{id}/documents/upload-url`.
 * Aligned with OpenAPI components.schemas.UploadUrlResponse.
 */
export const uploadUrlResponseSchema = z.object({
  fileId: z.string(),
  uploadUrl: z.string().url(),
  uploadToken: z.string(),
  storageKey: z.string(),
  expiresIn: z.number().int(),
});
export type UploadUrlResponse = z.infer<typeof uploadUrlResponseSchema>;

/**
 * Presigned download URL payload returned by `GET /service-requests/{id}/documents/{documentId}/download-url`.
 * Aligned with OpenAPI components.schemas.DownloadUrlResponse.
 */
export const downloadUrlResponseSchema = z.object({
  document: z.object({
    _id: z.string(),
    documentType: z.string(),
    verificationStatus: DocumentVerificationStatusEnum,
  }),
  url: z.string().url(),
  expiresIn: z.number().int(),
});
export type DownloadUrlResponse = z.infer<typeof downloadUrlResponseSchema>;

/**
 * Query schema for admin service requests queue (`GET /service-requests/admin`).
 */
export const serviceRequestQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: ServiceRequestStatusEnum.optional(),
  ownerId: z.string().optional(),
  planId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type ServiceRequestQueryInput = z.infer<
  typeof serviceRequestQuerySchema
>;

/**
 * Paginated admin service requests result schema.
 */
export const paginatedAdminServiceRequestsSchema = createPaginatedDataSchema(
  adminServiceRequestSchema,
);
export type PaginatedAdminServiceRequests = z.infer<
  typeof paginatedAdminServiceRequestsSchema
>;

/**
 * Statuses an admin may set via `PATCH /service-requests/{id}/status`.
 * `Closed` is set only by assigning a photographer.
 */
export const AdminServiceRequestStatusEnum = z.enum([
  "Under_Review",
  "Docs_Verified",
  "Approved",
  "Rejected",
  "More_Info_Required",
  "Cancelled",
]);
export type AdminServiceRequestStatus = z.infer<
  typeof AdminServiceRequestStatusEnum
>;

/**
 * Body for admin `PATCH /service-requests/{id}/status`.
 */
export const updateServiceRequestStatusSchema = z.object({
  status: AdminServiceRequestStatusEnum,
  reason: z.string().trim().optional(),
});
export type UpdateServiceRequestStatusInput = z.infer<
  typeof updateServiceRequestStatusSchema
>;

/**
 * Body for admin `PATCH /service-requests/{id}/documents/{documentId}/verify`.
 */
export const verifyDocumentSchema = z.object({
  verificationStatus: DocumentVerificationStatusEnum,
  reason: z.string().trim().optional(),
});
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;

/**
 * Body for admin `PATCH /service-requests/{id}/assign-photographer`.
 */
export const assignPhotographerSchema = z.object({
  photographerName: z
    .string()
    .trim()
    .min(2, "Enter the photographer's full name"),
});
export type AssignPhotographerInput = z.infer<typeof assignPhotographerSchema>;
