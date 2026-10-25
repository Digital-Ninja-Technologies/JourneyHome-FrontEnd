import { z } from "zod";

export { redirectSearchSchema, type RedirectSearch } from "@journeyhome/schemas";

export const querySearchSchema = z.object({
  q: z.string().optional(),
  filter: z.string().optional(),
});
export type QuerySearch = z.infer<typeof querySearchSchema>;
