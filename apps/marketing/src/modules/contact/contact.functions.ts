import { createServerFn } from "@tanstack/react-start";
import { api } from "@/lib/api";
import { type ContactResponse, contactSubmissionSchema } from "./types";

export const submitContactFn = createServerFn({ method: "POST" })
  .validator(contactSubmissionSchema)
  .handler(async ({ data }) =>
    api<ContactResponse>("/contact", { method: "POST", body: data }),
  );
