import { z } from "zod";

/**
 * Standard query parameters for paginated endpoints.
 * Aligned with OpenAPI components.parameters.Page and Limit.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Standard pagination metadata returned by list endpoints.
 * Aligned with OpenAPI components.schemas.Pagination.
 */
export const paginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Factory helper to produce consistent paginated data objects:
 * { items: T[], pagination: PaginationMeta }
 */
export const createPaginatedDataSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    pagination: paginationMetaSchema,
  });

export type PaginatedData<T> = {
  items: T[];
  pagination: PaginationMeta;
};
