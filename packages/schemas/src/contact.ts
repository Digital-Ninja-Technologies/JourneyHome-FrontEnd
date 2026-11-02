import { z } from "zod";

export const contactTopics = [
  "Starting a plan",
  "An existing plan",
  "Photographer network",
  "Something else",
] as const;

export type ContactTopic = (typeof contactTopics)[number];

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  topic: z.enum(contactTopics),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export const contactResponseSchema = z.object({
  received: z.boolean(),
  id: z.string().optional(),
});

export type ContactResponse = z.infer<typeof contactResponseSchema>;
