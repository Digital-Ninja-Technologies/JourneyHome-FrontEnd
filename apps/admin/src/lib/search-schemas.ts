import { z } from "zod";

export const redirectSearchSchema = z.object({
  redirect: z
    .string()
    .startsWith("/")
    .refine((value) => !value.startsWith("//"))
    .optional(),
});
export type RedirectSearch = z.infer<typeof redirectSearchSchema>;

export const querySearchSchema = z.object({
  q: z.string().optional(),
  filter: z.string().optional(),
});
export type QuerySearch = z.infer<typeof querySearchSchema>;
