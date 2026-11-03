import { useMutation } from "@tanstack/react-query";
import { submitContactFn } from "./contact.functions";
import type { ContactSubmissionInput } from "./types";

export function useSubmitContact() {
  return useMutation({
    mutationFn: (input: ContactSubmissionInput) =>
      submitContactFn({ data: input }),
  });
}
