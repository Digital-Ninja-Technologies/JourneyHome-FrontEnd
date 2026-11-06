import { FormCombobox } from "@journeyhome/ui/components/form-combobox";
import {
  FormDatePicker,
  FormInput,
  FormPhoneInput,
  FormTextarea,
} from "@journeyhome/ui/components/form-fields";
import type { Control } from "react-hook-form";
import { NIGERIAN_STATES } from "@/modules/plans/plan-form";
import type { ServiceRequestFormValues } from "@/modules/service-requests/service-request-form";

type FieldsProps = { control: Control<ServiceRequestFormValues> };

/** Dates, state and venue. Bare fields: the parent supplies the grid. */
export function ServiceDetailsFields({ control }: FieldsProps) {
  return (
    <>
      <div className="min-w-0">
        <FormDatePicker
          control={control}
          name="dateOfDeath"
          label="Date of death"
          placeholder="Select date of death"
          maxDate={new Date()}
        />
      </div>
      <div className="min-w-0">
        <FormDatePicker
          control={control}
          name="expectedServiceDate"
          label="Expected date of service"
          placeholder="Select date of service"
          minDate={new Date()}
        />
      </div>
      <div className="min-w-0">
        <FormCombobox
          control={control}
          name="state"
          label="State"
          placeholder="Select state"
          searchPlaceholder="Search states…"
          options={NIGERIAN_STATES}
        />
      </div>
      <div className="min-w-0">
        <FormInput
          control={control}
          name="venue"
          label="Venue / burial location"
          autoComplete="off"
          placeholder="e.g. St. Peter's Church, Ikeja"
        />
      </div>
    </>
  );
}

/** Who the care team reaches on the day. Bare fields: the parent supplies the grid. */
export function ContactPersonFields({ control }: FieldsProps) {
  return (
    <>
      <div className="min-w-0">
        <FormInput
          control={control}
          name="contactPerson"
          label="Full name"
          autoComplete="off"
          placeholder="e.g. Chidi Okafor"
        />
      </div>
      <div className="min-w-0">
        <FormPhoneInput
          control={control}
          name="contactPhone"
          label="Phone number"
          placeholder="e.g. 0803 123 4567"
          description="Outside Nigeria? Start with + and the country code."
        />
      </div>
    </>
  );
}

export function AdditionalInfoField({ control }: FieldsProps) {
  return (
    <FormTextarea
      control={control}
      name="additionalInformation"
      label="Anything we should know? (optional)"
      rows={3}
      placeholder="Scale of the event, number of guests, special requests…"
    />
  );
}
