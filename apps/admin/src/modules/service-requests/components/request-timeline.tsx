import type { ServiceRequest } from "@journeyhome/schemas";
import { formatDateTime } from "@/lib/format";

/** Key moments, oldest first. Only events with a timestamp are shown. */
export function RequestTimeline({ request: r }: { request: ServiceRequest }) {
  const events: [what: string, when: string | undefined, note?: string][] = [
    ["Submitted", r.createdAt],
    ["Approved", r.approvedAt],
    [
      "Photographer assigned",
      r.photographerAssignedAt,
      [r.photographerName, r.photographerPhoneNo].filter(Boolean).join(" · ") ||
        undefined,
    ],
    [
      "Rejected",
      r.status === "Rejected" ? r.updatedAt : undefined,
      r.rejectionReason,
    ],
    [
      "Asked the customer for more",
      r.status === "More_Info_Required" ? r.updatedAt : undefined,
      r.moreInfoReason,
    ],
  ];
  const shown = events
    .filter((e): e is [string, string, string | undefined] => Boolean(e[1]))
    .sort((a, b) => +new Date(a[1]) - +new Date(b[1]));

  return (
    <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
      {shown.map(([what, when, note]) => (
        <li key={what} className="relative">
          <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-accent ring-4 ring-white" />
          <div className="text-sm font-semibold">{what}</div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(when)}
          </div>
          {note && <p className="mt-1 text-[13px] text-ink-soft">{note}</p>}
        </li>
      ))}
    </ol>
  );
}
