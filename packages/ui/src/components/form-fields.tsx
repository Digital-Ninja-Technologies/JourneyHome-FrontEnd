"use client";

import type * as React from "react";
import type { ComponentProps } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";
import { cn } from "../lib/utils";
import { Checkbox } from "./checkbox";
import { DatePicker } from "./date-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "./input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";
import { PasswordInput } from "./password-input";
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
  label?: React.ReactNode;
  description?: React.ReactNode;
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
        {...field}
        {...props}
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
/*                              FormPasswordInput                             */
/* -------------------------------------------------------------------------- */

export interface FormPasswordInputProps<T extends FieldValues>
  extends Omit<ComponentProps<typeof PasswordInput>, "name">,
    BaseFormProps<T> {}

export function FormPasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  description,
  ...props
}: FormPasswordInputProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <PasswordInput
        {...field}
        {...props}
        id={field.name}
        aria-invalid={fieldState.invalid}
        className={className}
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
        {...field}
        {...props}
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
/*                                FormCheckbox                                */
/* -------------------------------------------------------------------------- */

export interface FormCheckboxProps<T extends FieldValues>
  extends Omit<
      ComponentProps<typeof Checkbox>,
      "name" | "checked" | "onCheckedChange"
    >,
    BaseFormProps<T> {}

export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  className,
  description,
  ...props
}: FormCheckboxProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <Field
      orientation="horizontal"
      data-invalid={fieldState.invalid}
      className={cn("flex flex-row items-start space-x-3 space-y-0", className)}
    >
      <Checkbox
        {...props}
        id={field.name}
        ref={field.ref}
        checked={Boolean(field.value)}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={fieldState.invalid}
      />
      <div className="space-y-1 leading-none">
        {label && (
          <FieldLabel
            htmlFor={field.name}
            className="cursor-pointer font-normal"
          >
            {label}
          </FieldLabel>
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError>{fieldState.error?.message}</FieldError>
      </div>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 FormOtpInput                               */
/* -------------------------------------------------------------------------- */

export interface FormOtpInputProps<T extends FieldValues>
  extends BaseFormProps<T> {
  maxLength?: number;
  onComplete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FormOtpInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  maxLength = 6,
  onComplete,
  disabled,
}: FormOtpInputProps<T>) {
  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <div className="flex w-full justify-center">
              <InputOTP
                maxLength={maxLength}
                value={field.value ?? ""}
                onChange={field.onChange}
                onComplete={onComplete}
                disabled={disabled}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {fieldState.error && (
              <FieldError className="text-center">
                {fieldState.error.message}
              </FieldError>
            )}
          </>
        )}
      />
      {description && (
        <FieldDescription className="text-center">
          {description}
        </FieldDescription>
      )}
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 FormSelect                                 */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormSelectProps<T extends FieldValues>
  extends BaseFormProps<T> {
  placeholder?: string;
  options?: readonly (string | SelectOption)[];
  items?: readonly (string | SelectOption)[];
  className?: string;
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select an option",
  options,
  items,
  className,
  description,
  disabled,
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ name, control, disabled });

  const rawOptions = options ?? items ?? [];
  const normalizedOptions: SelectOption[] = rawOptions.map((opt) =>
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
          className={cn("w-full", className)}
        >
          <SelectValue placeholder={placeholder}>
            {normalizedOptions.find((opt) => opt.value === field.value)
              ?.label ?? placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
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

/* -------------------------------------------------------------------------- */
/*                               FormDatePicker                               */
/* -------------------------------------------------------------------------- */

export interface FormDatePickerProps<T extends FieldValues>
  extends BaseFormProps<T> {
  placeholder?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  fromYear?: number;
  toYear?: number;
  yearOrder?: "asc" | "desc";
  disabled?: boolean;
  className?: string;
  valueFormat?: "iso" | "date-string" | "date";
  disabledDates?: (date: Date) => boolean;
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  fromYear,
  toYear,
  yearOrder,
  disabled,
  className,
  valueFormat = "date-string",
  disabledDates,
}: FormDatePickerProps<T>) {
  const { field, fieldState } = useController({ name, control, disabled });

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      field.onChange(null);
      return;
    }
    if (valueFormat === "date") {
      field.onChange(date);
    } else if (valueFormat === "date-string") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      field.onChange(`${year}-${month}-${day}`);
    } else {
      field.onChange(date.toISOString());
    }
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <DatePicker
        id={field.name}
        value={field.value}
        onChange={handleDateChange}
        placeholder={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        fromYear={fromYear}
        toYear={toYear}
        yearOrder={yearOrder}
        disabled={disabled ?? field.disabled}
        className={cn(
          fieldState.invalid &&
            "border-destructive ring-destructive/20 ring-[3px]",
          className,
        )}
        disabledDates={disabledDates}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  );
}
