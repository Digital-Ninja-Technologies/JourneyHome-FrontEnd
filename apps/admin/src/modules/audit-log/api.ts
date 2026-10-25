import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";

export async function fetchAuditLog(): Promise<AuditEntry[]> {
  return api<AuditEntry[]>("/audit-logs");
}
