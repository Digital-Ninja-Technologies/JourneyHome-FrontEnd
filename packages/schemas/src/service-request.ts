import { z } from "zod";
import {
  DocumentTypeEnum,
  DocumentVerificationStatusEnum,
  ServiceRequestStatusEnum,
} from "./enums";
import { coveredPersonSchema } from "./plan";

export const serviceDocumentSchema = z.object({
  _id: z.string(),
  documentType: DocumentTypeEnum,
  verificationStatus: DocumentVerificationStatusEnum,
  rejectionReason: z.string().optional(),
  uploadedAt: z.string(),
  replacedBy: z.string().optional(),
});
export type ServiceDocument = z.infer<typeof serviceDocumentSchema>;

export const serviceRequestSchema = z.object({
  _id: z.string(),
  plan: z.string(),
  owner: z.string().optional(),
  coveredPersonSnapshot: coveredPersonSchema,
  dateOfDeath: z.string(),
  burialLocation: z.string().min(1, "Burial location is required"),
  expectedBurialDate: z.string(),
  contactPerson: z.string().min(1, "Contact person is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  additionalInformation: z.string().optional(),
  status: ServiceRequestStatusEnum,
  rejectionReason: z.string().optional(),
  moreInfoReason: z.string().optional(),
  verifiedAt: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;

export const createServiceRequestSchema = z.object({
  plan: z.string().min(1, "Plan selection is required"),
  dateOfDeath: z.string().min(1, "Date of passing is required"),
  burialLocation: z.string().trim().min(2, "Burial location is required"),
  expectedBurialDate: z.string().min(1, "Expected burial date is required"),
  contactPerson: z.string().trim().min(2, "Contact person name is required"),
  contactPhone: z.string().trim().min(5, "Contact phone number is required"),
  additionalInformation: z.string().trim().optional(),
});
export type CreateServiceRequestInput = z.infer<
  typeof createServiceRequestSchema
>;

export const serviceRequestDetailSchema = z.object({
  request: serviceRequestSchema,
  documents: z.array(serviceDocumentSchema),
});
export type ServiceRequestDetail = z.infer<typeof serviceRequestDetailSchema>;
