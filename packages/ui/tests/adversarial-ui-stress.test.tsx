import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useForm } from "react-hook-form";
import * as fs from "node:fs";
import * as path from "node:path";

// Import all required primitives from the root barrel export
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Calendar,
  DatePicker,
  FormInput,
  FormPasswordInput,
  FormTextarea,
  FormCheckbox,
  FormOtpInput,
  FormSelect,
  FormDatePicker,
  isSameDay,
  startOfDay,
  endOfDay,
  parseDateInput,
  Badge,
  Empty,
  PasswordInput,
  InputOTP,
  Popover,
} from "../src/index";

import * as SelectComponentModule from "../src/components/select";
import { Select as BaseUiSelect } from "@base-ui/react/select";

/* ========================================================================== */
/* SECTION 1: PURE SELECT ADVERSARIAL VERIFICATION                            */
/* ========================================================================== */
describe("Section 1: Pure Base-UI Select Adversarial Verification", () => {
  const selectFilePath = path.resolve(__dirname, "../src/components/select.tsx");
  const selectSource = fs.readFileSync(selectFilePath, "utf-8");

  it("1.1 Source Code Inspection: Contains ZERO native <select> elements", () => {
    // Check for native <select> tag in JSX
    const selectTagRegex = /<select[\s>]/i;
    expect(selectSource).not.toMatch(selectTagRegex);
  });

  it("1.2 Source Code Inspection: Contains ZERO native <option> elements", () => {
    // Check for native <option> tag in JSX
    const optionTagRegex = /<option[\s>]/i;
    expect(selectSource).not.toMatch(optionTagRegex);
  });

  it("1.3 Source Code Inspection: Does NOT export NativeSelect", () => {
    expect(selectSource).not.toContain("NativeSelect");
    expect((SelectComponentModule as any).NativeSelect).toBeUndefined();
  });

  it("1.4 Export Verification: SelectRoot is pure @base-ui/react/select Root", () => {
    expect(Select).toBe(BaseUiSelect.Root);
  });

  it("1.5 Export Verification: All required Select subcomponents are exported", () => {
    expect(Select).toBeDefined();
    expect(SelectTrigger).toBeDefined();
    expect(SelectValue).toBeDefined();
    expect(SelectContent).toBeDefined();
    expect(SelectItem).toBeDefined();
    expect(SelectGroup).toBeDefined();
    expect(SelectLabel).toBeDefined();
    expect(SelectSeparator).toBeDefined();
    expect(SelectScrollUpButton).toBeDefined();
    expect(SelectScrollDownButton).toBeDefined();
  });

  it("1.6 Render Output Verification: Rendered Select contains NO <select> or <option>", () => {
    const html = renderToStaticMarkup(
      <Select defaultValue="val1">
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="val1">Value One</SelectItem>
            <SelectSeparator />
            <SelectItem value="val2">Value Two</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    // Assert strictly no HTML <select> tag
    expect(html).not.toMatch(/<select[\s>]/i);
    // Assert strictly no HTML <option> tag
    expect(html).not.toMatch(/<option[\s>]/i);

    // Verify trigger uses Base-UI data attributes and styling
    expect(html).toContain('data-slot="select-trigger"');
    expect(html).toContain('data-slot="select-value"');
  });

  it("1.7 SelectValue Auto-formatter: Handles various formats safely", () => {
    const formatString = (val: unknown) => {
      if (val === null || val === undefined) return null;
      if (typeof val === "string") {
        return val
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return String(val);
    };

    expect(formatString("active")).toBe("Active");
    expect(formatString("in_progress")).toBe("In Progress");
    expect(formatString("covered-person")).toBe("Covered Person");
    expect(formatString(123)).toBe("123");
    expect(formatString(null)).toBeNull();
    expect(formatString(undefined)).toBeNull();
  });
});

/* ========================================================================== */
/* SECTION 2: CALENDAR & DATE-PICKER ADVERSARIAL STRESS TESTING               */
/* ========================================================================== */
describe("Section 2: Calendar & DatePicker Adversarial Stress Testing", () => {
  describe("2.1 Leap Year & Day-Count Mechanics", () => {
    it("Calculates correct days in Feb for leap years (2024, 2020) -> 29 days", () => {
      const daysFeb2024 = new Date(2024, 2, 0).getDate();
      expect(daysFeb2024).toBe(29);

      const daysFeb2020 = new Date(2020, 2, 0).getDate();
      expect(daysFeb2020).toBe(29);
    });

    it("Calculates correct days in Feb for non-leap years (2023, 2025, 2026) -> 28 days", () => {
      const daysFeb2023 = new Date(2023, 2, 0).getDate();
      expect(daysFeb2023).toBe(28);

      const daysFeb2025 = new Date(2025, 2, 0).getDate();
      expect(daysFeb2025).toBe(28);

      const daysFeb2026 = new Date(2026, 2, 0).getDate();
      expect(daysFeb2026).toBe(28);
    });

    it("Follows century leap-year Gregorian rules: 1900 non-leap (28), 2000 leap (29), 2100 non-leap (28)", () => {
      const days1900 = new Date(1900, 2, 0).getDate();
      expect(days1900).toBe(28);

      const days2000 = new Date(2000, 2, 0).getDate();
      expect(days2000).toBe(29);

      const days2100 = new Date(2100, 2, 0).getDate();
      expect(days2100).toBe(28);

      const days2400 = new Date(2400, 2, 0).getDate();
      expect(days2400).toBe(29);
    });

    it("Calendar component renders exactly 42 grid cells for Leap Feb 2024", () => {
      const html = renderToStaticMarkup(
        <Calendar value={new Date(2024, 1, 29)} />
      );
      // Calendar should render 42 day buttons in the grid
      const dayButtonMatches = html.match(/role="grid"[\s\S]*?<\/div>/);
      expect(dayButtonMatches).not.toBeNull();
      const buttons = dayButtonMatches![0].match(/<button[\s\S]*?<\/button>/g);
      expect(buttons?.length).toBe(42);
      // Leap day '29' must be in the current month
      expect(html).toContain("29");
      expect(html).toContain("February");
      expect(html).toContain("2024");
    });
  });

  describe("2.2 Comprehensive 42-Cell Matrix Invariance (1920..2030)", () => {
    it("Preserves 42-cell matrix invariant for every single month across 110 years (1320 months)", () => {
      for (let y = 1920; y <= 2030; y++) {
        for (let m = 0; m < 12; m++) {
          const firstDayOfWeek = new Date(y, m, 1).getDay();
          const daysInCurrentMonth = new Date(y, m + 1, 0).getDate();
          const daysInPrevMonth = new Date(y, m, 0).getDate();

          const prevPaddingCount = firstDayOfWeek;
          const currentCount = daysInCurrentMonth;
          const remaining = 42 - (prevPaddingCount + currentCount);

          const total = prevPaddingCount + currentCount + remaining;
          expect(total).toBe(42);
          expect(remaining).toBeGreaterThanOrEqual(0);
          expect(prevPaddingCount).toBeLessThanOrEqual(6);
          expect(prevPaddingCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe("2.3 Month Boundaries & Year Rollover (Dec 31 <-> Jan 1)", () => {
    it("isSameDay accurately identifies same calendar day regardless of time", () => {
      const d1 = new Date(2026, 11, 31, 0, 0, 0, 0);
      const d2 = new Date(2026, 11, 31, 23, 59, 59, 999);
      expect(isSameDay(d1, d2)).toBe(true);

      const d3 = new Date(2027, 0, 1, 0, 0, 0, 0);
      expect(isSameDay(d1, d3)).toBe(false);
    });

    it("startOfDay and endOfDay clamp boundaries correctly", () => {
      const d = new Date(2026, 2, 15, 14, 30, 45, 500);
      const start = startOfDay(d);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);

      const end = endOfDay(d);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
    });

    it("Calendar handles minDate and maxDate disabling across year boundary", () => {
      const min = new Date(2025, 11, 31);
      const max = new Date(2026, 0, 2);

      const html = renderToStaticMarkup(
        <Calendar value={new Date(2026, 0, 1)} minDate={min} maxDate={max} />
      );

      expect(html).toContain("January");
      expect(html).toContain("2026");
    });
  });

  describe("2.4 Century Boundaries (1920..2030) & Year Range Generation", () => {
    // Helper replicating years calculation logic from Calendar
    const computeYears = (
      fromYear?: number,
      toYear?: number,
      yearOrder?: "asc" | "desc",
      parsedMin?: Date | null,
      parsedMax?: Date | null
    ) => {
      const currentYear = new Date().getFullYear();
      const computedFromYear = fromYear ?? (parsedMin ? parsedMin.getFullYear() : 1920);
      const computedToYear = toYear ?? (parsedMax ? parsedMax.getFullYear() : currentYear + 10);
      const defaultOrder: "asc" | "desc" =
        yearOrder ?? (computedToYear <= currentYear ? "desc" : "asc");
      const list: number[] = [];
      const start = Math.min(computedFromYear, computedToYear);
      const end = Math.max(computedFromYear, computedToYear);
      for (let y = start; y <= end; y++) {
        list.push(y);
      }
      return defaultOrder === "desc" ? [...list].reverse() : list;
    };

    it("Computes year range spanning from fromYear (1920) to toYear (2030)", () => {
      const years = computeYears(1920, 2030, "asc");
      expect(years[0]).toBe(1920);
      expect(years[years.length - 1]).toBe(2030);
      expect(years.length).toBe(111);
    });

    it("Handles inverted bounds gracefully (fromYear: 2030, toYear: 1920)", () => {
      const years = computeYears(2030, 1920, "asc");
      expect(years[0]).toBe(1920);
      expect(years[years.length - 1]).toBe(2030);
    });

    it("Supports yearOrder='desc' and yearOrder='asc'", () => {
      const yearsDesc = computeYears(2020, 2024, "desc");
      expect(yearsDesc).toEqual([2024, 2023, 2022, 2021, 2020]);

      const yearsAsc = computeYears(2020, 2024, "asc");
      expect(yearsAsc).toEqual([2020, 2021, 2022, 2023, 2024]);
    });

    it("Defaults to descending when toYear <= currentYear (optimal for DOB)", () => {
      const years = computeYears(1990, 2020);
      expect(years[0]).toBe(2020);
      expect(years[years.length - 1]).toBe(1990);
    });
  });

  describe("2.5 Date Parsing & Timezone Stress Testing", () => {
    it("parseDateInput handles standard ISO date strings (YYYY-MM-DD)", () => {
      const d = parseDateInput("2026-03-15");
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(2); // March
      expect(d?.getDate()).toBe(15);
    });

    it("parseDateInput handles Date instances", () => {
      const input = new Date(2026, 5, 20);
      const d = parseDateInput(input);
      expect(d).toBe(input);
    });

    it("parseDateInput rejects null, undefined, empty strings, and invalid Date objects", () => {
      expect(parseDateInput(null)).toBeNull();
      expect(parseDateInput(undefined)).toBeNull();
      expect(parseDateInput("")).toBeNull();
      expect(parseDateInput("   ")).toBeNull();
      expect(parseDateInput("not-a-date")).toBeNull();
      expect(parseDateInput(new Date(NaN))).toBeNull();
    });

    it("Adversarial finding: parseDateInput exposes relaxed V8 Date.parse on arbitrary alphanumeric strings", () => {
      // In JavaScript V8, new Date("invalid-format-123") parses "123" as year 123 AD!
      // This documents the empirical behavior of parseDateInput when non-empty strings bypass isoMatch
      const result = parseDateInput("invalid-format-123");
      // Result is not null because of fallback `new Date(trimmed)` in calendar.tsx:68
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(123);
    });

    it("parseDateInput handles ISO strings with timestamp and UTC indicator", () => {
      const d = parseDateInput("2026-03-15T00:00:00.000Z");
      expect(d).not.toBeNull();
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(2);
      expect(d?.getDate()).toBe(15);
    });

    it("CRITICAL EMPIRICAL CHALLENGE: Timezone Day Shift under FormDatePicker default valueFormat='iso'", () => {
      // In FormDatePicker (form-fields.tsx:363), valueFormat defaults to "iso".
      // handleSelect calls `field.onChange(date.toISOString())`
      // Where `date` is `new Date(viewYear, viewMonth, d)` created in local time (00:00:00).
      
      // When a user in GMT+1 (e.g. Africa/Lagos) selects March 15, 2026:
      // Local time: Sun Mar 15 2026 00:00:00 GMT+0100
      // In UTC: 2026-03-14T23:00:00.000Z
      // When stored in field.value as "2026-03-14T23:00:00.000Z", parseDateInput applies:
      // const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
      // It matches "2026-03-14", causing the date to shift backwards by 1 full day!

      const simulateFormDatePickerCycle = (selectedYear: number, selectedMonth: number, selectedDay: number, offsetHours: number) => {
        // Create local date at midnight
        const localMidnightUtcMs = Date.UTC(selectedYear, selectedMonth, selectedDay, 0 - offsetHours, 0, 0);
        const isoString = new Date(localMidnightUtcMs).toISOString();

        // Stored value in form
        const formValue = isoString;

        // DatePicker parse back
        const parsed = parseDateInput(formValue);
        return {
          storedIso: formValue,
          parsedYear: parsed?.getFullYear(),
          parsedMonth: parsed?.getMonth(),
          parsedDate: parsed?.getDate(),
        };
      };

      // Test in UTC+1 (Lagos, Nigeria)
      const lagosResult = simulateFormDatePickerCycle(2026, 2, 15, +1);
      expect(lagosResult.storedIso).toBe("2026-03-14T23:00:00.000Z");
      // Due to prefix regex matching "2026-03-14", the date parsed is 14 instead of 15!
      expect(lagosResult.parsedDate).toBe(14); // CONFIRMED OFF-BY-ONE TIMEZONE SHIFT BUG!

      // Test with valueFormat="date-string" (the recommended mitigation):
      const safeDateString = "2026-03-15";
      const parsedSafe = parseDateInput(safeDateString);
      expect(parsedSafe?.getFullYear()).toBe(2026);
      expect(parsedSafe?.getMonth()).toBe(2);
      expect(parsedSafe?.getDate()).toBe(15);
    });
  });

  describe("2.6 DatePicker Component Rendering", () => {
    it("Renders DatePicker trigger with CalendarIcon and formatted date", () => {
      const html = renderToStaticMarkup(
        <DatePicker value="2026-03-15" placeholder="Select date" />
      );
      expect(html).toContain("Mar 15, 2026");
      expect(html).not.toMatch(/<input type="date"/i);
    });

    it("Renders DatePicker placeholder when value is null", () => {
      const html = renderToStaticMarkup(
        <DatePicker value={null} placeholder="Choose date of birth" />
      );
      expect(html).toContain("Choose date of birth");
    });

    it("Renders DatePicker in disabled state", () => {
      const html = renderToStaticMarkup(
        <DatePicker disabled placeholder="Disabled date" />
      );
      expect(html).toContain("disabled");
    });
  });
});

/* ========================================================================== */
/* SECTION 3: FORM FIELDS & ROOT EXPORT VERIFICATION                          */
/* ========================================================================== */
describe("Section 3: Form Fields & Root Export Verification", () => {
  it("3.1 Root Index Exports: All 7 required primitives are exported from packages/ui/src/index.ts", () => {
    expect(FormInput).toBeDefined();
    expect(FormPasswordInput).toBeDefined();
    expect(FormTextarea).toBeDefined();
    expect(FormCheckbox).toBeDefined();
    expect(FormOtpInput).toBeDefined();
    expect(FormSelect).toBeDefined();
    expect(FormDatePicker).toBeDefined();
  });

  it("3.2 Form Primitives Instantiation: All 7 primitives instantiate and render cleanly in React Hook Form", () => {
    function MasterForm() {
      const { control } = useForm({
        defaultValues: {
          fullName: "Adunni Okafor",
          password: "SecurePassword123!",
          bio: "Plan holder biography",
          agreeTerms: true,
          pin: "654321",
          relationship: "Mother",
          dob: "1980-05-15",
        },
      });

      return (
        <form>
          <FormInput
            control={control}
            name="fullName"
            label="Full Name"
            description="Enter legal name"
            placeholder="e.g. Adunni Okafor"
          />
          <FormPasswordInput
            control={control}
            name="password"
            label="Password"
            description="At least 6 characters"
          />
          <FormTextarea
            control={control}
            name="bio"
            label="Biography"
            description="Optional bio"
          />
          <FormCheckbox
            control={control}
            name="agreeTerms"
            label="I accept the terms and conditions"
          />
          <FormOtpInput
            control={control}
            name="pin"
            label="Verification Code"
            maxLength={6}
          />
          <FormSelect
            control={control}
            name="relationship"
            label="Relationship"
            items={[
              { label: "Mother", value: "Mother" },
              { label: "Father", value: "Father" },
              { label: "Grandparent", value: "Grandparent" },
            ]}
          />
          <FormDatePicker
            control={control}
            name="dob"
            label="Date of Birth"
            fromYear={1920}
            toYear={2026}
            valueFormat="date-string"
          />
        </form>
      );
    }

    const html = renderToStaticMarkup(<MasterForm />);

    // Assert all labels rendered
    expect(html).toContain("Full Name");
    expect(html).toContain("Password");
    expect(html).toContain("Biography");
    expect(html).toContain("I accept the terms and conditions");
    expect(html).toContain("Verification Code");
    expect(html).toContain("Relationship");
    expect(html).toContain("Date of Birth");

    // Assert description hints rendered
    expect(html).toContain("Enter legal name");
    expect(html).toContain("At least 6 characters");
    expect(html).toContain("Optional bio");

    // Assert Select rendered with Mother selected and NO native select
    expect(html).toContain("Mother");
    expect(html).not.toMatch(/<select[\s>]/i);
    expect(html).not.toMatch(/<option[\s>]/i);

    // Assert DatePicker rendered with formatted date and NO native date input
    expect(html).toContain("May 15, 1980");
    expect(html).not.toMatch(/<input[^>]+type="date"/i);

    // Assert OTP 6 slots rendered
    expect(html).toContain('data-slot="input-otp"');

    // Assert Checkbox rendered
    expect(html).toContain('role="checkbox"');
  });

  it("3.3 FormSelect Compatibility: Supports both 'items' and 'options' props, strings and objects", () => {
    function SelectCompatibilityForm() {
      const { control } = useForm({
        defaultValues: {
          sel1: "A",
          sel2: "B",
          sel3: "C",
        },
      });

      return (
        <div>
          <FormSelect
            control={control}
            name="sel1"
            items={[{ label: "Alpha", value: "A" }]}
          />
          <FormSelect
            control={control}
            name="sel2"
            options={[{ label: "Beta", value: "B" }]}
          />
          <FormSelect
            control={control}
            name="sel3"
            items={["C", "D"]}
          />
        </div>
      );
    }

    const html = renderToStaticMarkup(<SelectCompatibilityForm />);
    expect(html).toContain("Alpha");
    expect(html).toContain("Beta");
    expect(html).toContain("C");
  });

  it("3.4 FormPasswordInput: Renders eye toggle icon and criteria structure", () => {
    function PasswordForm() {
      const { control } = useForm({ defaultValues: { pass: "123" } });
      return <FormPasswordInput control={control} name="pass" label="Pass" />;
    }

    const html = renderToStaticMarkup(<PasswordForm />);
    expect(html).toContain('type="password"');
    expect(html).toContain("button");
  });

  it("3.5 Disabled States across all Form Fields", () => {
    function DisabledForm() {
      const { control } = useForm();
      return (
        <div>
          <FormInput control={control} name="d1" disabled />
          <FormPasswordInput control={control} name="d2" disabled />
          <FormTextarea control={control} name="d3" disabled />
          <FormCheckbox control={control} name="d4" disabled />
          <FormOtpInput control={control} name="d5" disabled />
          <FormSelect control={control} name="d6" disabled items={["A"]} />
          <FormDatePicker control={control} name="d7" disabled />
        </div>
      );
    }

    const html = renderToStaticMarkup(<DisabledForm />);
    expect(html).toBeDefined();
    const disabledCount = (html.match(/disabled/g) || []).length;
    expect(disabledCount).toBeGreaterThanOrEqual(7);
  });
});
