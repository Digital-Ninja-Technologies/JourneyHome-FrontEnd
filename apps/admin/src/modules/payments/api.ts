import {
  type AdminPaymentQueryInput,
  type PaginatedAdminPayments,
  paginatedAdminPaymentsSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchPaymentsParams = Partial<AdminPaymentQueryInput>;

/** One page of transactions plus status totals for the selected date range. */
export async function fetchPayments(
  params?: FetchPaymentsParams,
): Promise<PaginatedAdminPayments> {
  const res = await api<unknown>(`/payments/admin${toQueryString(params)}`);
  return parseApiResponse(
    paginatedAdminPaymentsSchema,
    res,
    "Invalid payments response from server",
  );
}
