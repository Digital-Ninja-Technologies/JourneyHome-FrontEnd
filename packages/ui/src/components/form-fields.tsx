import type { ComponentProps } from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";
import { cn } from "../lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";

export interface BaseFormProps<T extends FieldValues> {
  control?: Control<T, any, any>;
  name: Path<T>;
  label?: string;
  description?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  FormInput                                 */
/* -------------------------------------------------------------------------- */

export interface FormInputProps<T extends FieldValues>
  extends Omit<ComponentProps<"input">, "name">,
    BaseFormProps<T> {}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  description,
  ...props
}: FormInputProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        {...props}
        {...field}
        id={field.name}
        aria-invalid={fieldState.invalid}
        className={cn("", className)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*                                FormTextarea                                */
/* -------------------------------------------------------------------------- */

export interface FormTextareaProps<T extends FieldValues>
  extends Omit<ComponentProps<"textarea">, "name">,
    BaseFormProps<T> {}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  className,
  description,
  ...props
}: FormTextareaProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Textarea
        {...props}
        {...field}
        id={field.name}
        aria-invalid={fieldState.invalid}
        className={cn("resize-none", className)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 FormSelect                                 */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps<T extends FieldValues>
  extends BaseFormProps<T> {
  placeholder?: string;
  options: readonly (string | SelectOption)[];
  className?: string;
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select an option",
  options,
  className,
  description,
  disabled,
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ name, control, disabled });

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Select
        name={field.name}
        value={field.value ?? ""}
        onValueChange={field.onChange}
        disabled={disabled ?? field.disabled}
      >
        <SelectTrigger
          id={field.name}
          ref={field.ref}
          onBlur={field.onBlur}
          aria-invalid={fieldState.invalid}
          className={cn("w-full h-12 rounded-xl bg-background border-border", className)}
        >
          <SelectValue placeholder={placeholder}>
            {normalizedOptions.find((opt) => opt.value === field.value)?.label ??
              placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  );
}
