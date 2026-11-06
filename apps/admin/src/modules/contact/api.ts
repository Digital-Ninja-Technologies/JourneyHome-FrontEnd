import {
  type ContactQueryInput,
  type ContactRecord,
  contactRecordSchema,
  type PaginatedContactSubmissions,
  paginatedContactSubmissionsSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchContactMessagesParams = Partial<
  Pick<ContactQueryInput, "page" | "limit" | "search">
>;

/** Newest first. `search` matches the sender's name or email. */
export async function fetchContactMessages(
  params?: FetchContactMessagesParams,
): Promise<PaginatedContactSubmissions> {
  const res = await api<unknown>(`/contact/admin${toQueryString(params)}`);
  return parseApiResponse(
    paginatedContactSubmissionsSchema,
    res,
    "Invalid contact messages response from server",
  );
}

export async function fetchContactMessage(id: string): Promise<ContactRecord> {
  const res = await api<unknown>(`/contact/admin/${id}`);
  return parseApiResponse(
    contactRecordSchema,
    res,
    "Invalid contact message response from server",
  );
}
