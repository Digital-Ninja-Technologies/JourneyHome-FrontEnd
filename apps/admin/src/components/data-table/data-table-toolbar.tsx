import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@journeyhome/ui/components/select";
import { useDebouncedValue } from "@journeyhome/ui/hooks/use-debounced-value";
import { Search, X } from "lucide-react";
import * as React from "react";

const ALL = "all";

export interface DataTableToolbarProps {
  search?: string;
  /** Called with the debounced value; `undefined` when cleared. */
  onSearchChange?: (value: string | undefined) => void;
  searchPlaceholder?: string;
  hasActiveFilters?: boolean;
  onReset?: () => void;
  /** Filter selects and extra actions, rendered on the right. */
  children?: React.ReactNode;
}

export function DataTableToolbar({
  search = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  hasActiveFilters = false,
  onReset,
  children,
}: DataTableToolbarProps) {
  // Local text so typing feels instant; the URL only updates once typing pauses.
  const [text, setText] = React.useState(search);
  const debounced = useDebouncedValue(text, 350);

  // Pick up outside changes (reset, back/forward).
  React.useEffect(() => setText(search), [search]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only fire when the debounced text settles
  React.useEffect(() => {
    const next = debounced.trim();
    if (next !== search.trim()) onSearchChange?.(next || undefined);
  }, [debounced]);

  return (
    <div className="flex flex-col gap-2.5 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      {onSearchChange ? (
        <div className="relative w-full min-w-0 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-10 w-full min-w-0 rounded-lg border-border/70 bg-accent/10 pl-8 pr-7 text-xs"
          />
          {text && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setText("");
                onSearchChange(undefined);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {children}
        {hasActiveFilters && onReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setText("");
              onReset();
            }}
            className="h-8 gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

export interface FilterOption<V extends string> {
  value: V;
  label: string;
}

/** Compact "Label: value" filter select with an "All" choice that maps to `undefined`. */
export function DataTableFilter<V extends string>({
  label,
  value,
  options,
  onChange,
  allLabel = "All",
}: {
  label: string;
  value: V | undefined;
  options: readonly FilterOption<V>[];
  onChange: (value: V | undefined) => void;
  allLabel?: string;
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(val) => {
        if (!val) return;
        onChange(val === ALL ? undefined : (val as V));
      }}
    >
      <SelectTrigger
        size="xs"
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="w-auto min-w-0 max-w-full bg-white sm:max-w-56"
      >
        <span className="text-muted-foreground">{label}</span>
        <SelectValue>
          {(v: string | null) =>
            options.find((o) => o.value === v)?.label ?? allLabel
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent size="xs" align="end" alignItemWithTrigger={false}>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
