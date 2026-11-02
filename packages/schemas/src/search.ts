import { z } from "zod";

export const redirectSearchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return (
          val.startsWith("/") && !val.startsWith("//") && !val.includes("://")
        );
      },
      { message: "Redirect URL must be a valid internal path" },
    ),
});
export type RedirectSearch = z.infer<typeof redirectSearchSchema>;

/** Search params for the signup flow; `package` (or legacy `packageId`) carries the package picked on marketing. */
export const signupSearchSchema = z.object({
  package: z.coerce.string().optional(),
  packageId: z.coerce.string().optional(),
});
export type SignupSearch = z.infer<typeof signupSearchSchema>;

export const resolveSelectedPackage = (
  search: Partial<SignupSearch> | undefined,
): string | undefined => search?.package || search?.packageId || undefined;

export const sanitizeRedirect = (
  rawRedirect: string | undefined | null,
  fallback = "/",
): string => {
  if (!rawRedirect) return fallback;
  if (
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//") &&
    !rawRedirect.includes("://")
  ) {
    return rawRedirect;
  }
  return fallback;
};

export const querySearchSchema = z.object({
  q: z.string().optional(),
  filter: z.string().optional(),
});
export type QuerySearch = z.infer<typeof querySearchSchema>;

export const paginationSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});
export type PaginationSearch = z.infer<typeof paginationSearchSchema>;

export const planFilterSearchSchema = z.object({
  plan: z.string().optional(),
  new: z.string().optional(),
});
export type PlanFilterSearch = z.infer<typeof planFilterSearchSchema>;

export const paymentCallbackSearchSchema = z.object({
  reference: z.string().optional(),
  trxref: z.string().optional(),
});
export type PaymentCallbackSearch = z.infer<typeof paymentCallbackSearchSchema>;

export const profileSearchSchema = z.object({
  card_added: z.string().optional(),
});
export type ProfileSearch = z.infer<typeof profileSearchSchema>;
