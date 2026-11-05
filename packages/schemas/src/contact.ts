import { z } from "zod";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";

export const contactTopics = [
  "Starting a plan",
  "An existing plan",
  "Photographer network",
  "Something else",
] as const;
export type ContactTopic = (typeof contactTopics)[number];

export const contactTopicEnum = z.enum(contactTopics);

/**
 * Public payload for submitting the contact form (`POST /contact`).
 */
export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().min(5, "Phone number is required").max(30),
  email: z.string().trim().email("Invalid email address"),
  topic: contactTopicEnum,
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(2000),
});
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

/**
 * Persisted contact submission record returned by the API.
 * Aligned with OpenAPI components.schemas.ContactSubmission.
 */
export const contactRecordSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.email(),
  topic: contactTopicEnum,
  message: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),
});
export type ContactRecord = z.infer<typeof contactRecordSchema>;

/**
 * Alias for backwards compatibility.
 */
export const contactResponseSchema = contactRecordSchema;
export type ContactResponse = ContactRecord;

/**
 * Query schema for admin `GET /contact`.
 */
export const contactQuerySchema = paginationQuerySchema.extend({
  topic: contactTopicEnum.optional(),
  search: z.string().optional(),
});
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;

/**
 * Paginated contact submissions result schema.
 */
export const paginatedContactSubmissionsSchema =
  createPaginatedDataSchema(contactRecordSchema);
export type PaginatedContactSubmissions = z.infer<
  typeof paginatedContactSubmissionsSchema
>;
