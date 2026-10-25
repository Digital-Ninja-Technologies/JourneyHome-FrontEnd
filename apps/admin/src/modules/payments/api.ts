import { api } from "@/lib/api";
import type { AdminPayment } from "@/lib/types";

export async function fetchAdminPayments(): Promise<AdminPayment[]> {
  return api<AdminPayment[]>("/payments/admin");
}
