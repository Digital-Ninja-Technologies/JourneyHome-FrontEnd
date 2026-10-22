/** Downloads rows as a CSV file, entirely in the browser. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob(
    [`﻿${rows.map((r) => r.map(cell).join(",")).join("\n")}`],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
