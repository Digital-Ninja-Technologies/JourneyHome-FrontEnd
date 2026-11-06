import { z } from "zod";
import { api, parseApiResponse } from "@/lib/api";

/** Off-spec: `GET /audit-logs` isn't in api-doc.yaml yet. */
export const auditEntrySchema = z.object({
  _id: z.string(),
  actor: z.string().optional(),
  actorName: z.string().optional(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  resourceLabel: z.string().optional(),
  createdAt: z.string(),
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;

export async function fetchAuditLog(): Promise<AuditEntry[]> {
  const res = await api<unknown>("/audit-logs");
  return parseApiResponse(
    z.array(auditEntrySchema),
    res,
    "Invalid audit log response from server",
  );
}
