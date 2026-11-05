"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import type { Matcher } from "react-day-picker";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Calendar, type CalendarProps } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function startOfDay(d: Date): Date {
  const res = new Date(d);
  res.setHours(0, 0, 0, 0);
  return res;
}

export function endOfDay(d: Date): Date {
  const res = new Date(d);
  res.setHours(23, 59, 59, 999);
  return res;
}

export function parseDateInput(
  value: Date | string | null | undefined,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = Number.parseInt(isoMatch[1], 10);
      const month = Number.parseInt(isoMatch[2], 10) - 1;
      const day = Number.parseInt(isoMatch[3], 10);
      return new Date(year, month, day);
    }
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export interface DatePickerProps {
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | null) => void;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  fromYear?: number;
  toYear?: number;
  yearOrder?: "asc" | "desc";
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  formatStr?: string;
  disabledDates?: (date: Date) => boolean;
  calendarProps?: Partial<
    Omit<CalendarProps, "mode" | "selected" | "onSelect">
  >;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  selected,
  onSelect,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  fromYear,
  toYear,
  yearOrder: _yearOrder,
  captionLayout,
  disabled = false,
  className,
  id,
  name,
  formatStr = "PPP",
  disabledDates,
  calendarProps,
  align = "start",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DatePickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const isControlled = value !== undefined || selected !== undefined;
  const [uncontrolledDate, setUncontrolledDate] = React.useState<
    Date | undefined
  >(() => {
    return (
      selected ??
      (value !== undefined
        ? parseDateInput(value)
        : parseDateInput(defaultValue)) ??
      undefined
    );
  });

  const activeDate = React.useMemo(() => {
    if (selected !== undefined) return selected;
    if (value !== undefined) return parseDateInput(value) ?? undefined;
    return uncontrolledDate;
  }, [value, selected, uncontrolledDate]);

  const handleSelect = (newDate: Date | undefined) => {
    if (!isControlled) {
      setUncontrolledDate(newDate);
    }
    onChange?.(newDate ?? null);
    onSelect?.(newDate);
    setOpen(false);
  };

  const parsedMin = React.useMemo(() => parseDateInput(minDate), [minDate]);
  const parsedMax = React.useMemo(() => parseDateInput(maxDate), [maxDate]);

  const computedFromYear =
    fromYear ?? (parsedMin ? parsedMin.getFullYear() : undefined);
  const computedToYear =
    toYear ?? (parsedMax ? parsedMax.getFullYear() : undefined);

  const startMonth =
    calendarProps?.startMonth ??
    (computedFromYear !== undefined
      ? new Date(computedFromYear, 0)
      : (parsedMin ?? undefined));
  const endMonth =
    calendarProps?.endMonth ??
    (computedToYear !== undefined
      ? new Date(computedToYear, 11)
      : (parsedMax ?? undefined));

  const disabledMatchers = React.useMemo(() => {
    const matchers: Matcher[] = [];
    if (calendarProps?.disabled) {
      if (Array.isArray(calendarProps.disabled)) {
        matchers.push(...calendarProps.disabled);
      } else {
        matchers.push(calendarProps.disabled);
      }
    }
    if (parsedMin) {
      matchers.push({ before: parsedMin });
    }
    if (parsedMax) {
      matchers.push({ after: parsedMax });
    }
    if (disabledDates) {
      matchers.push(disabledDates);
    }
    return matchers.length > 0 ? matchers : undefined;
  }, [calendarProps?.disabled, parsedMin, parsedMax, disabledDates]);

  const resolvedCaptionLayout =
    captionLayout ??
    (computedFromYear !== undefined || computedToYear !== undefined
      ? "dropdown"
      : "label");

  let formattedDate: string | null = null;
  if (activeDate) {
    try {
      formattedDate = format(activeDate, formatStr);
    } catch {
      formattedDate = activeDate.toLocaleDateString();
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        name={name}
        disabled={disabled}
        render={
          <Button
            id={id}
            name={name}
            variant="outline"
            disabled={disabled}
            data-empty={!activeDate}
            className={cn(
              "h-12 w-full min-w-0 justify-start rounded-xl border border-border bg-background px-3.5 text-sm font-normal text-foreground shadow-none transition-colors hover:bg-muted/20 hover:text-foreground hover:translate-y-0 active:scale-100 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 data-[empty=true]:text-foreground/40 aria-invalid:border-destructive",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 text-foreground/50" />
        {activeDate && formattedDate ? (
          formattedDate
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={activeDate ?? undefined}
          onSelect={handleSelect}
          defaultMonth={activeDate ?? parsedMax ?? parsedMin ?? undefined}
          startMonth={startMonth}
          endMonth={endMonth}
          captionLayout={resolvedCaptionLayout}
          disabled={disabledMatchers}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!date}
            className="h-12 w-full min-w-0 justify-start rounded-xl border border-border bg-background px-3.5 text-sm font-normal text-foreground shadow-none transition-colors hover:bg-muted/20 hover:text-foreground hover:translate-y-0 active:scale-100 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 data-[empty=true]:text-foreground/40 aria-invalid:border-destructive"
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 text-foreground/50" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}
