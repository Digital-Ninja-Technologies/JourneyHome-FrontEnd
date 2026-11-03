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
  phone: z.string().trim().min(5, "Phone number is required").max(30),
  email: z.string().trim().email("Invalid email address"),
  topic: z.enum(contactTopics),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export const contactResponseSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  topic: z.string().optional(),
  message: z.string().optional(),
  createdAt: z.string().optional(),
  received: z.boolean().optional(),
});

export type ContactResponse = z.infer<typeof contactResponseSchema>;
