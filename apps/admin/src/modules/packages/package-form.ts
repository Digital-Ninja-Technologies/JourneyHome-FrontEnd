import type { AdminPackage, CreatePackageInput } from "@journeyhome/schemas";
import { z } from "zod";

/**
 * The form edits the price in naira (major units), which is what the API's
 * create/update endpoints accept. Features are typed one per line.
 */
export const packageFormSchema = z.object({
  name: z.string().trim().min(2, "Give the package a name"),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  amount: z.coerce
    .number("Enter the monthly price")
    .positive("The price must be more than ₦0")
    .max(100_000_000, "That price looks too high"),
  features: z.string(),
  isActive: z.boolean(),
});
export type PackageFormInput = z.input<typeof packageFormSchema>;
export type PackageFormValues = z.output<typeof packageFormSchema>;

export const packageFormDefaults: PackageFormInput = {
  name: "",
  description: "",
  amount: "",
  features: "",
  isActive: true,
};

export function toPackageFormValues(pkg: AdminPackage): PackageFormInput {
  return {
    name: pkg.name,
    description: pkg.description,
    amount: String(pkg.amount / 100),
    features: pkg.features.join("\n"),
    isActive: pkg.isActive,
  };
}

export function toPackageBody(values: PackageFormValues): CreatePackageInput {
  return {
    name: values.name,
    description: values.description || undefined,
    amount: values.amount,
    features: values.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
    currency: "NGN",
    billingInterval: "monthly",
    isActive: values.isActive,
  };
}
