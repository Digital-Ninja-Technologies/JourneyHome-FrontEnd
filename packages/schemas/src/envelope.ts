import { z } from "zod";

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
  });

export type ApiResponseSchema<T extends z.ZodType> = z.infer<
  ReturnType<typeof apiResponseSchema<T>>
>;
