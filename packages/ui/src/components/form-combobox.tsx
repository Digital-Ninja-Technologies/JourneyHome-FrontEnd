"use client";

import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import * as React from "react";
import { type FieldValues, useController } from "react-hook-form";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./drawer";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import type { BaseFormProps } from "./form-fields";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface FormComboboxProps<T extends FieldValues>
  extends BaseFormProps<T> {
  placeholder?: string;
  searchPlaceholder?: string;
  options: readonly (string | ComboboxOption)[];
  /** Lets the user keep a value that isn't in `options` ("Use “…”"). */
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

/** Search + list built on shadcn `Command` (cmdk). */
function ComboboxPanel({
  searchPlaceholder,
  options,
  value,
  allowCustom,
  onSelect,
  listClassName,
  className,
}: {
  searchPlaceholder: string;
  options: ComboboxOption[];
  value: string;
  allowCustom: boolean;
  onSelect: (value: string) => void;
  listClassName?: string;
  className?: string;
}) {
  const [query, setQuery] = React.useState("");
  const trimmed = query.trim();
  const q = trimmed.toLowerCase();
  const exact = options.some(
    (o) => o.label.toLowerCase() === q || o.value.toLowerCase() === q,
  );

  return (
    <Command className={cn("rounded-2xl", className)}>
      <CommandInput
        placeholder={searchPlaceholder}
        value={query}
        onValueChange={setQuery}
        className="text-base sm:text-sm"
      />
      <CommandList className={listClassName}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((o) => (
            <CommandItem
              key={o.value}
              value={o.label}
              data-checked={o.value === value}
              onSelect={() => onSelect(o.value)}
              className="min-h-11 sm:min-h-9"
            >
              {o.label}
            </CommandItem>
          ))}
          {allowCustom && trimmed && !exact && (
            <CommandItem
              // Always shown, regardless of cmdk's own filtering.
              forceMount
              value={`__custom__${trimmed}`}
              data-checked={value === trimmed}
              onSelect={() => onSelect(trimmed)}
              className="min-h-11 sm:min-h-9"
            >
              Use “{trimmed}”
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/* -------------------------------------------------------------------------- */
/*                                FormCombobox                                */
/* -------------------------------------------------------------------------- */

const TRIGGER_CLASS =
  "flex h-12 w-full min-w-0 items-center rounded-xl border border-border bg-background pl-3.5 text-left text-sm text-foreground transition-colors outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20";

/**
 * Searchable single-select. A popover on desktop, a bottom sheet on mobile.
 * With `allowCustom`, typing something that isn't listed offers to keep it as-is.
 */
export function FormCombobox<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  options,
  allowCustom = false,
  className,
  disabled,
}: FormComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  // Bumped on every open so the panel remounts with an empty search.
  const [session, setSession] = React.useState(0);
  const isMobile = useIsMobile();
  const { field, fieldState } = useController({ name, control, disabled });
  const isDisabled = Boolean(disabled ?? field.disabled);
  const value: string = field.value ?? "";

  const normalized = React.useMemo<ComboboxOption[]>(
    () =>
      options.map((o) => (typeof o === "string" ? { label: o, value: o } : o)),
    [options],
  );

  const displayText =
    normalized.find((o) => o.value === value)?.label || value || placeholder;
  const hasClear = Boolean(value) && !isDisabled;

  function handleOpenChange(next: boolean) {
    if (next) setSession((n) => n + 1);
    setOpen(next);
    if (!next) field.onBlur();
  }

  function handleSelect(next: string) {
    field.onChange(next);
    handleOpenChange(false);
  }

  const triggerContent = (
    <span
      className={cn(
        "block min-w-0 flex-1 truncate",
        !value && "text-foreground/40",
      )}
    >
      {displayText}
    </span>
  );
  const triggerClass = cn(
    TRIGGER_CLASS,
    hasClear ? "pr-16" : "pr-9",
    className,
  );

  const panel = (className?: string, listClassName?: string) => (
    <ComboboxPanel
      key={session}
      searchPlaceholder={searchPlaceholder}
      options={normalized}
      value={value}
      allowCustom={allowCustom}
      onSelect={handleSelect}
      className={className}
      listClassName={listClassName}
    />
  );

  return (
    <Field data-invalid={fieldState.invalid} className="min-w-0">
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <div className="relative flex w-full min-w-0 items-center">
        {isMobile ? (
          <button
            id={field.name}
            ref={field.ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={fieldState.invalid}
            disabled={isDisabled}
            onClick={() => handleOpenChange(true)}
            className={triggerClass}
          >
            {triggerContent}
          </button>
        ) : (
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
              render={
                <button
                  id={field.name}
                  ref={field.ref}
                  type="button"
                  role="combobox"
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  aria-invalid={fieldState.invalid}
                  disabled={isDisabled}
                  className={triggerClass}
                />
              }
            >
              {triggerContent}
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-(--anchor-width) min-w-60 gap-0 overflow-hidden p-0"
            >
              {panel("p-0", "max-h-64")}
            </PopoverContent>
          </Popover>
        )}

        <div className="absolute right-3 flex items-center gap-1">
          {hasClear && (
            <button
              type="button"
              aria-label={`Clear ${typeof label === "string" ? label.toLowerCase() : "selection"}`}
              onClick={() => {
                field.onChange("");
                field.onBlur();
              }}
              className="grid size-6 place-items-center rounded-full text-foreground/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
          <ChevronsUpDownIcon
            aria-hidden
            className="pointer-events-none size-4 shrink-0 text-foreground/50"
          />
        </div>
      </div>

      {isMobile && (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="h-[70dvh]">
            <DrawerHeader className="pb-2 text-left">
              <DrawerTitle>{label ?? placeholder}</DrawerTitle>
            </DrawerHeader>
            {panel("min-h-0 flex-1", "max-h-none flex-1")}
          </DrawerContent>
        </Drawer>
      )}

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  );
}
