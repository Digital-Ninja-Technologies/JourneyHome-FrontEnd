import { z } from "zod";
import { createPaginatedDataSchema, paginationQuerySchema } from "./pagination";

/**
 * Populated actor on audit logs.
 * Aligned with OpenAPI components.schemas.AuditLogActor.
 */
export const auditLogActorSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
});
export type AuditLogActor = z.infer<typeof auditLogActorSchema>;

const auditLogBaseSchema = z.object({
  _id: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),
});

/**
 * Audit log with `actor` populated (list and detail responses).
 * System actions may have no actor.
 * Aligned with OpenAPI components.schemas.AuditLog.
 */
export const auditLogSchema = auditLogBaseSchema.extend({
  actor: auditLogActorSchema.nullable().optional(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

/**
 * Audit log with `actor` as an id string (`DELETE /audit-logs/{id}` response).
 * Aligned with OpenAPI components.schemas.AuditLogRaw.
 */
export const auditLogRawSchema = auditLogBaseSchema.extend({
  actor: z.string().nullable().optional(),
});
export type AuditLogRaw = z.infer<typeof auditLogRawSchema>;

export const paginatedAuditLogsSchema =
  createPaginatedDataSchema(auditLogSchema);
export type PaginatedAuditLogs = z.infer<typeof paginatedAuditLogsSchema>;

/**
 * Query schema for `GET /audit-logs`. `startDate`/`endDate` accept
 * `YYYY-MM-DD` or ISO date-times (the API also accepts `from`/`to` aliases).
 */
export const auditLogQuerySchema = paginationQuerySchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
});
export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;
