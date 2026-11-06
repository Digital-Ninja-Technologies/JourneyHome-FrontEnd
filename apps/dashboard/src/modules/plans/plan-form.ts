import type { CreatePlanInput } from "@journeyhome/schemas";
import { isValidPhone, toE164 } from "@journeyhome/ui/lib/phone";
import { z } from "zod";
import { dayToIso, parseDay } from "@/lib/date";

export const RELATIONSHIPS = [
  "Mother",
  "Father",
  "Grandparent",
  "Uncle / Aunt",
  "Other",
] as const;

export const GENDERS = ["Female", "Male"] as const;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const planFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter the full name (at least 2 letters)"),
  relationship: z.string().min(1, "Select a relationship"),
  dateOfBirth: z
    .string()
    .min(1, "Select a date of birth")
    .refine((v) => parseDay(v) !== null, "Enter a valid date of birth")
    .refine((v) => {
      const d = parseDay(v);
      return d === null || d.getTime() <= Date.now();
    }, "Date of birth can't be in the future"),
  gender: z.enum(GENDERS, "Select a gender"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .refine(
      (v) => isValidPhone(v),
      "Enter a valid phone number, e.g. 0803 123 4567 (or +country code for numbers outside Nigeria)",
    ),
  state: z.string().trim(),
  address: z
    .string()
    .trim()
    .min(5, "Enter the full home address (at least 5 characters)"),
  packageId: z.string().min(1, "Choose a package"),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

export const planFormDefaults: PlanFormValues = {
  fullName: "",
  relationship: "Mother",
  dateOfBirth: "",
  gender: "Female",
  phoneNumber: "",
  state: "",
  address: "",
  packageId: "",
};

/** Builds the `POST /plans` body from validated form values. */
export function toCreatePlanBody(values: PlanFormValues): CreatePlanInput {
  const address = values.address.trim();
  const state = values.state.trim();
  return {
    packageId: values.packageId,
    coveredPerson: {
      fullName: values.fullName.trim(),
      relationship: values.relationship.toLowerCase(),
      dateOfBirth: dayToIso(values.dateOfBirth),
      gender: values.gender.toLowerCase(),
      phoneNumber: toE164(values.phoneNumber) ?? values.phoneNumber.trim(),
      // The backend stores a single address string, so state/location is folded into it.
      address: state ? `${address}, ${state}` : address,
    },
  };
}
