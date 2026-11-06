import type { DocumentType } from "@journeyhome/schemas";
import { isValidPhone, toE164 } from "@journeyhome/ui/lib/phone";
import { z } from "zod";
import { dayToIso, parseDay } from "@/lib/date";
import { REQUIRED_DOCS } from "@/modules/service-requests/service-requests.utils";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const requiredFile = (message: string) => z.instanceof(File, { message });

export const serviceRequestSchema = z
  .object({
    planId: z.string().min(1, "Choose a plan"),
    dateOfDeath: z
      .string()
      .min(1, "Select the date of death")
      .refine((v) => parseDay(v) !== null, "Enter a valid date")
      .refine((v) => {
        const d = parseDay(v);
        return d === null || d.getTime() <= Date.now();
      }, "Date of death can't be in the future"),
    expectedServiceDate: z
      .string()
      .min(1, "Select the expected service date")
      .refine((v) => parseDay(v) !== null, "Enter a valid date")
      .refine((v) => {
        const d = parseDay(v);
        return d === null || d.getTime() >= startOfToday().getTime();
      }, "Service date can't be in the past"),
    state: z.string().trim().min(1, "Select a state"),
    venue: z.string().trim().min(3, "Enter the venue (at least 3 characters)"),
    contactPerson: z
      .string()
      .trim()
      .min(2, "Enter the contact's full name (at least 2 letters)"),
    contactPhone: z
      .string()
      .trim()
      .min(1, "Enter a phone number")
      .refine(
        (v) => isValidPhone(v),
        "Enter a valid phone number, e.g. 0803 123 4567 (or +country code for numbers outside Nigeria)",
      ),
    additionalInformation: z.string().trim(),
    documents: z.object({
      Death_Certificate: requiredFile("Please upload the death certificate."),
      Valid_Identification: requiredFile(
        "Please upload the valid ID of the deceased.",
      ),
    }),
  })
  .refine(
    ({ dateOfDeath, expectedServiceDate }) => {
      const dod = parseDay(dateOfDeath);
      const svc = parseDay(expectedServiceDate);
      return !dod || !svc || svc.getTime() >= dod.getTime();
    },
    {
      path: ["expectedServiceDate"],
      message: "Service date can't be before the date of death",
    },
  );

export type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

export const serviceRequestDefaults = (
  planId = "",
): ServiceRequestFormValues => ({
  planId,
  dateOfDeath: "",
  expectedServiceDate: "",
  state: "Lagos",
  venue: "",
  contactPerson: "",
  contactPhone: "",
  additionalInformation: "",
  // No file chosen yet; the schema's "required" message covers this until one is picked.
  documents: {} as ServiceRequestFormValues["documents"],
});

/** Builds the `POST /service-requests` body (documents are uploaded separately). */
export function toCreateServiceRequestBody(values: ServiceRequestFormValues) {
  const extra = values.additionalInformation.trim();
  return {
    planId: values.planId,
    dateOfDeath: dayToIso(values.dateOfDeath),
    serviceLocation: `${values.venue.trim()}, ${values.state.trim()}`,
    expectedServiceDate: dayToIso(values.expectedServiceDate),
    contactPerson: values.contactPerson.trim(),
    contactPhone: toE164(values.contactPhone) ?? values.contactPhone.trim(),
    ...(extra && { additionalInformation: extra }),
  };
}

/** The documents the user attached, in upload order. */
export function documentsToUpload(
  documents: ServiceRequestFormValues["documents"],
): [DocumentType, File][] {
  return REQUIRED_DOCS.flatMap((type) => {
    const file = documents[type as keyof typeof documents];
    return file ? [[type, file] as [DocumentType, File]] : [];
  });
}
