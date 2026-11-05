import { z } from "zod";

/**
 * Standard API response envelope aligned with OpenAPI components.schemas.Envelope.
 */
export const envelopeSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type Envelope = z.infer<typeof envelopeSchema>;

/**
 * Wraps any data schema in the standard success envelope.
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  envelopeSchema.extend({
    data: dataSchema,
  });

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiResponseSchema<T extends z.ZodType> = z.infer<
  ReturnType<typeof apiResponseSchema<T>>
>;

export class ApiValidationError extends Error {
  public issues: z.core.$ZodIssue[];

  constructor(message: string, issues: z.core.$ZodIssue[] = []) {
    super(message);
    this.name = "ApiValidationError";
    this.issues = issues;
  }
}

/**
 * Safely parses data using a Zod schema and throws ApiValidationError on failure.
 */
export function parseApiResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context = "API response validation failed",
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issueSummary = result.error.issues
      .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
      .join("; ");
    throw new ApiValidationError(
      `${context}: ${issueSummary}`,
      result.error.issues,
    );
  }
  return result.data;
}
