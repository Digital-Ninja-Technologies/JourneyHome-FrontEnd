import { FormCombobox } from "@journeyhome/ui/components/form-combobox";
import {
  FormDatePicker,
  FormInput,
  FormPhoneInput,
  FormSelect,
} from "@journeyhome/ui/components/form-fields";
import { cn } from "@journeyhome/ui/lib/utils";
import type { Control } from "react-hook-form";
import {
  GENDERS,
  NIGERIAN_STATES,
  type PlanFormValues,
  RELATIONSHIPS,
} from "@/modules/plans/plan-form";

/**
 * "Who is this plan for?" fields. Renders bare fields so the parent decides the layout:
 * wrap it in a `FieldGroup` with the grid you want and pass `addressClassName`
 * (e.g. `lg:col-span-2`) to make the address span the full row.
 */
export function CoveredPersonFields({
  control,
  addressClassName,
}: {
  control: Control<PlanFormValues>;
  addressClassName?: string;
}) {
  return (
    <>
      <div className="min-w-0">
        <FormInput
          control={control}
          name="fullName"
          label="Full name"
          autoComplete="off"
          placeholder="e.g. Adunni Okafor"
        />
      </div>
      <div className="min-w-0">
        <FormSelect
          control={control}
          name="relationship"
          label="Relationship"
          placeholder="Select relationship"
          options={RELATIONSHIPS}
        />
      </div>
      <div className="min-w-0">
        <FormDatePicker
          control={control}
          name="dateOfBirth"
          label="Date of birth"
          placeholder="Select date of birth"
          fromYear={1920}
          toYear={new Date().getFullYear()}
          yearOrder="desc"
          maxDate={new Date()}
        />
      </div>
      <div className="min-w-0">
        <FormSelect
          control={control}
          name="gender"
          label="Gender"
          placeholder="Select gender"
          options={GENDERS}
        />
      </div>
      <div className="min-w-0">
        <FormPhoneInput
          control={control}
          name="phoneNumber"
          label="Phone number"
          placeholder="e.g. 0803 123 4567"
          description="Outside Nigeria? Start with + and the country code."
        />
      </div>
      <div className="min-w-0">
        <FormCombobox
          control={control}
          name="state"
          label="State / location"
          placeholder="Select state"
          searchPlaceholder="Search states…"
          options={NIGERIAN_STATES}
          allowCustom
        />
      </div>
      <div className={cn("min-w-0", addressClassName)}>
        <FormInput
          control={control}
          name="address"
          label="Home address"
          autoComplete="off"
          placeholder="e.g. 14 Awolowo Road, Ikoyi"
        />
      </div>
    </>
  );
}
