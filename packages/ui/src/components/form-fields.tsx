"use client";

import type * as React from "react";
import type { ComponentProps } from "react";
import { useRef } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form";
import {
  caretAfterMoneyChars,
  countMoneyCharsBefore,
  formatMoneyInput,
} from "../lib/money";
import {
  type CountryCode,
  caretAfterDigits,
  countDigitsBefore,
  DEFAULT_PHONE_COUNTRY,
  formatPhoneInput,
} from "../lib/phone";
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
/*                               FormPhoneInput                               */
/* -------------------------------------------------------------------------- */

export interface FormPhoneInputProps<T extends FieldValues>
  extends Omit<
      ComponentProps<"input">,
      "name" | "value" | "onChange" | "type" | "defaultValue"
    >,
    BaseFormProps<T> {
  /** Region used to read numbers typed without a `+country` prefix. */
  defaultCountry?: CountryCode;
}

/**
 * Phone field that formats as the user types (`0803 123 4567`, `+234 803 123 4567`).
 * The form value is the formatted string; validate it with `isValidPhone` and convert
 * with `toE164` from `lib/phone` before sending it to an API.
 */
export function FormPhoneInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  description,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  ...props
}: FormPhoneInputProps<T>) {
  const { field, fieldState } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const raw = el.value;
    const previous: string = field.value ?? "";
    let source = raw;
    let caret = el.selectionStart ?? raw.length;

    // Backspacing over a separator ("0803 |123") removes no digit, so the formatter would
    // just put it back and the caret would never move. Treat it as deleting the digit before it.
    const onlySeparatorRemoved =
      raw.length < previous.length &&
      raw.replace(/\D/g, "") === previous.replace(/\D/g, "") &&
      raw.startsWith("+") === previous.startsWith("+");
    if (onlySeparatorRemoved) {
      const idx = raw.slice(0, caret).search(/\d(?=\D*$)/);
      if (idx >= 0) {
        source = raw.slice(0, idx) + raw.slice(idx + 1);
        caret = idx;
      }
    }

    const digitsBeforeCaret = countDigitsBefore(source, caret);
    const formatted = formatPhoneInput(source, defaultCountry);
    field.onChange(formatted);

    // Re-formatting moves the caret to the end; put it back where the user was typing.
    requestAnimationFrame(() => {
      const target = inputRef.current;
      if (!target || document.activeElement !== target) return;
      const pos = caretAfterDigits(formatted, digitsBeforeCaret);
      target.setSelectionRange(pos, pos);
    });
  }

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        autoComplete="tel"
        {...props}
        id={field.name}
        name={field.name}
        type="tel"
        inputMode="tel"
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        disabled={props.disabled ?? field.disabled}
        ref={(node) => {
          inputRef.current = node;
          field.ref(node);
        }}
        aria-invalid={fieldState.invalid}
        className={className}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/*                               FormMoneyInput                               */
/* -------------------------------------------------------------------------- */

export interface FormMoneyInputProps<T extends FieldValues>
  extends Omit<
      ComponentProps<"input">,
      "name" | "value" | "onChange" | "type" | "defaultValue" | "prefix"
    >,
    BaseFormProps<T> {
  /** Shown inside the field before the amount, e.g. `₦`. */
  currencySymbol?: React.ReactNode;
}

/**
 * Money field that groups thousands as the user types (`1,250,000.50`).
 * The form value is the formatted string; convert it with `parseMoneyInput` from
 * `lib/money` (e.g. in the zod schema) before sending it to an API.
 */
export function FormMoneyInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  description,
  currencySymbol,
  ...props
}: FormMoneyInputProps<T>) {
  const { field, fieldState } = useController({ name, control });
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const raw = el.value;
    const previous: string = field.value ?? "";
    let source = raw;
    let caret = el.selectionStart ?? raw.length;

    // Backspacing over a comma ("1,|000") removes nothing meaningful, so the formatter
    // would put it back. Treat it as deleting the digit before the comma instead.
    const onlySeparatorRemoved =
      raw.length < previous.length &&
      raw.replace(/[^\d.]/g, "") === previous.replace(/[^\d.]/g, "");
    if (onlySeparatorRemoved) {
      const idx = raw.slice(0, caret).search(/\d(?=[^\d]*$)/);
      if (idx >= 0) {
        source = raw.slice(0, idx) + raw.slice(idx + 1);
        caret = idx;
      }
    }

    const charsBeforeCaret = countMoneyCharsBefore(source, caret);
    const formatted = formatMoneyInput(source);
    field.onChange(formatted);

    requestAnimationFrame(() => {
      const target = inputRef.current;
      if (!target || document.activeElement !== target) return;
      const pos = caretAfterMoneyChars(formatted, charsBeforeCaret);
      target.setSelectionRange(pos, pos);
    });
  }

  const input = (
    <Input
      autoComplete="off"
      {...props}
      id={field.name}
      name={field.name}
      type="text"
      inputMode="decimal"
      value={field.value ?? ""}
      onChange={handleChange}
      onBlur={field.onBlur}
      disabled={props.disabled ?? field.disabled}
      ref={(node) => {
        inputRef.current = node;
        field.ref(node);
      }}
      aria-invalid={fieldState.invalid}
      className={cn("tabular-nums", currencySymbol && "pl-7", className)}
    />
  );

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      {currencySymbol ? (
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
          >
            {currencySymbol}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
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
