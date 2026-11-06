import { cn } from "@journeyhome/ui/lib/utils";
import type { Column, RowData, TableFeatures } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

/** Column header that toggles sorting and shows the current direction. */
export function SortHeader<
  TFeatures extends TableFeatures,
  TData extends RowData,
>({
  column,
  children,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: header value type varies per column
  column: Column<TFeatures, TData, any> & {
    getIsSorted: () => false | "asc" | "desc";
    getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
  };
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "group -ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 uppercase tracking-wider transition-colors hover:bg-muted hover:text-foreground",
        sorted && "text-foreground",
      )}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="size-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3" />
      ) : (
        <ChevronsUpDown className="size-3 opacity-40 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}
