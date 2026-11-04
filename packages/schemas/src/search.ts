import { z } from "zod";

export const redirectSearchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return (
          val.startsWith("/") &&
          !val.startsWith("//") &&
          !val.includes("://") &&
          !val.includes("\\")
        );
      },
      { message: "Redirect URL must be a valid path" },
    ),
});
export type RedirectSearch = z.infer<typeof redirectSearchSchema>;

export const verifyEmailSearchSchema = redirectSearchSchema.extend({
  token: z.string().optional(),
});
export type VerifyEmailSearch = z.infer<typeof verifyEmailSearchSchema>;

export const signupSearchSchema = redirectSearchSchema.extend({
  package: z.string().optional(),
});
export type SignupSearch = z.infer<typeof signupSearchSchema>;

export function resolveSelectedPackage(
  search: { package?: string } | undefined | null,
): string | undefined {
  if (!search?.package) return undefined;
  const p = search.package.trim();
  return p ? p : undefined;
}

export const sanitizeRedirect = (
  rawRedirect: string | undefined | null,
  fallback = "/",
): string => {
  if (!rawRedirect) return fallback;
  if (
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//") &&
    !rawRedirect.includes("://") &&
    !rawRedirect.includes("\\")
  ) {
    // Prevent self-referencing auth redirects that can trigger infinite loops
    if (
      rawRedirect === "/login" ||
      rawRedirect === "/login/" ||
      rawRedirect.startsWith("/login?") ||
      rawRedirect === "/signup" ||
      rawRedirect === "/signup/" ||
      rawRedirect.startsWith("/signup?")
    ) {
      return fallback;
    }
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
