"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

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

export function parseDateInput(value: Date | string | null | undefined): Date | null {
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

export interface CalendarProps {
  value?: Date | string | null;
  onSelect?: (date: Date) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  fromYear?: number;
  toYear?: number;
  yearOrder?: "asc" | "desc";
  className?: string;
  disabledDates?: (date: Date) => boolean;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  isToday: boolean;
}

export function Calendar({
  value,
  onSelect,
  minDate,
  maxDate,
  fromYear,
  toYear,
  yearOrder,
  className,
  disabledDates,
}: CalendarProps) {
  const parsedValue = React.useMemo(() => parseDateInput(value), [value]);
  const parsedMin = React.useMemo(() => parseDateInput(minDate), [minDate]);
  const parsedMax = React.useMemo(() => parseDateInput(maxDate), [maxDate]);

  const currentYear = new Date().getFullYear();
  const computedFromYear = fromYear ?? (parsedMin ? parsedMin.getFullYear() : 1920);
  const computedToYear = toYear ?? (parsedMax ? parsedMax.getFullYear() : currentYear + 10);

  const defaultOrder: "asc" | "desc" =
    yearOrder ?? (computedToYear <= currentYear ? "desc" : "asc");

  const years = React.useMemo(() => {
    const list: number[] = [];
    const start = Math.min(computedFromYear, computedToYear);
    const end = Math.max(computedFromYear, computedToYear);
    for (let y = start; y <= end; y++) {
      list.push(y);
    }
    return defaultOrder === "desc" ? list.reverse() : list;
  }, [computedFromYear, computedToYear, defaultOrder]);

  const initialDate = parsedValue ?? parsedMin ?? new Date();
  const [viewMonth, setViewMonth] = React.useState<number>(initialDate.getMonth());
  const [viewYear, setViewYear] = React.useState<number>(initialDate.getFullYear());

  React.useEffect(() => {
    if (parsedValue) {
      setViewMonth(parsedValue.getMonth());
      setViewYear(parsedValue.getFullYear());
    }
  }, [parsedValue]);

  const isPrevDisabled = React.useMemo(() => {
    if (!parsedMin) return false;
    const prevMonthEnd = new Date(viewYear, viewMonth, 0);
    return prevMonthEnd < startOfDay(parsedMin);
  }, [parsedMin, viewYear, viewMonth]);

  const isNextDisabled = React.useMemo(() => {
    if (!parsedMax) return false;
    const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
    return nextMonthStart > endOfDay(parsedMax);
  }, [parsedMax, viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isMonthDisabled = (mIndex: number, year: number): boolean => {
    if (parsedMin) {
      const lastDayOfMonth = new Date(year, mIndex + 1, 0);
      if (lastDayOfMonth < startOfDay(parsedMin)) return true;
    }
    if (parsedMax) {
      const firstDayOfMonth = new Date(year, mIndex, 1);
      if (firstDayOfMonth > endOfDay(parsedMax)) return true;
    }
    return false;
  };

  const isYearDisabled = (y: number): boolean => {
    if (parsedMin && y < parsedMin.getFullYear()) return true;
    if (parsedMax && y > parsedMax.getFullYear()) return true;
    return false;
  };

  const calendarDays = React.useMemo(() => {
    const today = new Date();
    const min = parsedMin ? startOfDay(parsedMin) : null;
    const max = parsedMax ? endOfDay(parsedMax) : null;

    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month padding days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(viewYear, viewMonth - 1, dayNum);
      const isDisabled =
        (min !== null && date < min) ||
        (max !== null && date > max) ||
        (disabledDates ? disabledDates(date) : false);

      days.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isDisabled,
        isSelected: parsedValue !== null && isSameDay(date, parsedValue),
        isToday: isSameDay(date, today),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const isDisabled =
        (min !== null && date < min) ||
        (max !== null && date > max) ||
        (disabledDates ? disabledDates(date) : false);

      days.push({
        date,
        dayNumber: d,
        isCurrentMonth: true,
        isDisabled,
        isSelected: parsedValue !== null && isSameDay(date, parsedValue),
        isToday: isSameDay(date, today),
      });
    }

    // Next month padding days to complete 42 cells (6 rows x 7 cols)
    const remainingCells = 42 - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const date = new Date(viewYear, viewMonth + 1, d);
      const isDisabled =
        (min !== null && date < min) ||
        (max !== null && date > max) ||
        (disabledDates ? disabledDates(date) : false);

      days.push({
        date,
        dayNumber: d,
        isCurrentMonth: false,
        isDisabled,
        isSelected: parsedValue !== null && isSameDay(date, parsedValue),
        isToday: isSameDay(date, today),
      });
    }

    return days;
  }, [viewYear, viewMonth, parsedValue, parsedMin, parsedMax, disabledDates]);

  return (
    <div className={cn("p-2 select-none w-72", className)}>
      {/* Month & Year Selectors with Navigation Chevrons */}
      <div className="flex items-center justify-between gap-1 pb-2 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous month</span>
        </Button>

        <div className="flex items-center gap-1.5">
          {/* Month Select Dropdown */}
          <Select
            value={String(viewMonth)}
            onValueChange={(val) => setViewMonth(Number(val))}
          >
            <SelectTrigger className="h-7 px-2 text-xs font-medium border-border/60">
              <SelectValue>{MONTHS[viewMonth]}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {MONTHS.map((month, index) => (
                <SelectItem
                  key={month}
                  value={String(index)}
                  disabled={isMonthDisabled(index, viewYear)}
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Select Dropdown */}
          <Select
            value={String(viewYear)}
            onValueChange={(val) => setViewYear(Number(val))}
          >
            <SelectTrigger className="h-7 px-2 text-xs font-medium border-border/60">
              <SelectValue>{String(viewYear)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {years.map((y) => (
                <SelectItem
                  key={y}
                  value={String(y)}
                  disabled={isYearDisabled(y)}
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleNextMonth}
          disabled={isNextDisabled}
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-1 pt-2" role="row">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[0.75rem] font-medium text-muted-foreground h-8 flex items-center justify-center"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1" role="grid">
        {calendarDays.map((d, idx) => (
          <button
            key={idx}
            type="button"
            disabled={d.isDisabled}
            onClick={() => {
              if (!d.isDisabled && onSelect) {
                onSelect(d.date);
              }
            }}
            className={cn(
              "h-8 w-8 text-xs font-normal rounded-lg flex items-center justify-center transition-colors outline-none",
              d.isSelected &&
                "bg-primary text-primary-foreground font-semibold hover:bg-primary/90",
              !d.isSelected &&
                d.isToday &&
                "border border-primary text-foreground font-semibold",
              !d.isSelected &&
                !d.isToday &&
                d.isCurrentMonth &&
                "text-foreground hover:bg-muted",
              !d.isSelected &&
                !d.isToday &&
                !d.isCurrentMonth &&
                "text-muted-foreground/40 hover:bg-muted/30",
              d.isDisabled &&
                "opacity-25 pointer-events-none cursor-not-allowed text-muted-foreground"
            )}
            aria-selected={d.isSelected}
            aria-disabled={d.isDisabled}
          >
            {d.dayNumber}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  fromYear?: number;
  toYear?: number;
  yearOrder?: "asc" | "desc";
  disabled?: boolean;
  className?: string;
  id?: string;
  disabledDates?: (date: Date) => boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  minDate,
  maxDate,
  fromYear,
  toYear,
  yearOrder,
  disabled,
  className,
  id,
  disabledDates,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsedDate = React.useMemo(() => parseDateInput(value), [value]);

  const handleSelect = (date: Date) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-start gap-2 rounded-4xl border border-input bg-input/30 px-3 py-2 text-sm text-left font-normal transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-9",
          !parsedDate && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        <span>
          {parsedDate
            ? parsedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start" sideOffset={4}>
        <Calendar
          value={parsedDate}
          onSelect={handleSelect}
          minDate={minDate}
          maxDate={maxDate}
          fromYear={fromYear}
          toYear={toYear}
          yearOrder={yearOrder}
          disabledDates={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );
}
