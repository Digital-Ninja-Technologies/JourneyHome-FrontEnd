import type { ContactSubmissionInput } from "@journeyhome/schemas";
import { useMutation } from "@tanstack/react-query";
import { submitContactForm } from "./api";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (input: ContactSubmissionInput) => submitContactForm(input),
  });
}
