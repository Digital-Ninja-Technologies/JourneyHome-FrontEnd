import type {
  ContactResponse,
  ContactSubmissionInput,
} from "@journeyhome/schemas";
import { api } from "../../lib/api";

export async function submitContactForm(
  data: ContactSubmissionInput,
): Promise<ContactResponse> {
  return api<ContactResponse>("/contact", {
    method: "POST",
    body: data,
  });
}
