import { createServerFn } from "@tanstack/react-start";
import { api } from "@/lib/api";
import {
  type ContactResponse,
  type ContactSubmissionInput,
  contactSubmissionSchema,
} from "./types";

export const submitContactFn = createServerFn({ method: "POST" })
  .validator((data: ContactSubmissionInput) =>
    contactSubmissionSchema.parse(data),
  )
  .handler(async ({ data }) =>
    api<ContactResponse>("/contact", { method: "POST", body: data }),
  );
