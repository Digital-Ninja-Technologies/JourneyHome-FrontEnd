import type { AdminPackage, CreatePackageInput } from "@journeyhome/schemas";
import { parseMoneyInput, toMoneyInput } from "@journeyhome/ui/lib/money";
import { z } from "zod";

/**
 * The form edits the price in naira (major units), which is what the API's
 * create/update endpoints accept. The field shows it with commas ("10,000"); the
 * schema strips them so the body carries a plain number. Features are edited as a
 * sortable list of `{ value }` rows (useFieldArray needs objects) and sent as strings.
 */
export const MAX_FEATURES = 20;
const FEATURE_MAX_LENGTH = 120;

export const packageFormSchema = z.object({
  name: z.string().trim().min(2, "Give the package a name"),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  amount: z
    .string()
    .transform(parseMoneyInput)
    .pipe(
      z
        .number("Enter the monthly price")
        .positive("The price must be more than ₦0")
        .max(100_000_000, "That price looks too high"),
    ),
  features: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, "Type a feature or remove this row")
          .max(
            FEATURE_MAX_LENGTH,
            `Keep it under ${FEATURE_MAX_LENGTH} characters`,
          ),
      }),
    )
    .max(MAX_FEATURES, `Add up to ${MAX_FEATURES} features`)
    .superRefine((rows, ctx) => {
      const seen = new Set<string>();
      rows.forEach((row, index) => {
        const key = row.value.toLowerCase();
        if (!key) return;
        if (seen.has(key)) {
          ctx.addIssue({
            code: "custom",
            path: [index, "value"],
            message: "This feature is already listed",
          });
        }
        seen.add(key);
      });
    }),
  isActive: z.boolean(),
});
export type PackageFormInput = z.input<typeof packageFormSchema>;
export type PackageFormValues = z.output<typeof packageFormSchema>;

export const packageFormDefaults: PackageFormInput = {
  name: "",
  description: "",
  amount: "",
  features: [],
  isActive: true,
};

export function toPackageFormValues(pkg: AdminPackage): PackageFormInput {
  return {
    name: pkg.name,
    description: pkg.description,
    amount: toMoneyInput(pkg.amount / 100),
    features: pkg.features.map((value) => ({ value })),
    isActive: pkg.isActive,
  };
}

export function toPackageBody(values: PackageFormValues): CreatePackageInput {
  return {
    name: values.name,
    description: values.description || undefined,
    amount: values.amount,
    features: values.features.map((f) => f.value),
    currency: "NGN",
    billingInterval: "monthly",
    isActive: values.isActive,
  };
}
