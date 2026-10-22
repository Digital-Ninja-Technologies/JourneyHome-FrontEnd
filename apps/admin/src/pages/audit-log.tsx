import { Select } from "@journeyhome/ui/components/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DemoNotice } from "@/components/demo-notice";
import { PageHeader, QueryError, SearchBox } from "@/components/ui";
import { isUnsupported, UNSUPPORTED_MESSAGE } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";
import { useAllRequests, useAuditLog, useDirectory } from "@/lib/queries";
import type { AuditEntry } from "@/lib/types";

const PAGE = 20;
const VERB: Record<string, string> = {
  "service_request.created": "submitted",
  "service_request.viewed_by_admin": "viewed",
  "service_request.docs_verified": "verified the documents for",
  "service_request.more_info_required": "asked for more information on",
  "service_request.approved": "approved",
  "service_request.rejected": "rejected",
};
const ACTION_LABEL: Record<string, string> = {
  "service_request.created": "Request submitted",
  "service_request.viewed_by_admin": "Request viewed",
  "service_request.docs_verified": "Documents verified",
  "service_request.more_info_required": "More info requested",
  "service_request.approved": "Request approved",
  "service_request.rejected": "Request rejected",
};
const humanise = (a: string) =>
  a.replace(/[._]/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function AuditLog() {
  const q = useAuditLog();
  const dir = useDirectory();
  const requestsQ = useAllRequests();
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("all");
  const [action, setAction] = useState("all");
  const [shown, setShown] = useState(PAGE);

  const requests = new Map((requestsQ.data ?? []).map((r) => [r._id, r]));
  const actorName = (e: AuditEntry) =>
    e.actorName ?? (e.actor ? dir.nameOf(e.actor) : "System");
  const resource = (e: AuditEntry) => {
    if (e.resourceLabel) return e.resourceLabel;
    const r = requests.get(e.resourceId);
    return r
      ? `${r.coveredPersonSnapshot.fullName}'s service request`
      : `${e.resourceType.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} ${e.resourceId.slice(-6)}`;
  };
  const sentence = (e: AuditEntry) =>
    `${actorName(e)} ${VERB[e.action] ?? `${humanise(e.action).toLowerCase()} —`} ${resource(e)}`;

  const all = useMemo(
    () =>
      [...(q.data ?? [])].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [q.data],
  );
  const actors = [...new Set(all.map(actorName))].sort();
  const actions = [...new Set(all.map((e) => e.action))].sort();
  const needle = search.trim().toLowerCase();
  const rows = all.filter(
    (e) =>
      (actor === "all" || actorName(e) === actor) &&
      (action === "all" || e.action === action) &&
      (!needle || sentence(e).toLowerCase().includes(needle)),
  );

  if (q.isError && isUnsupported(q.error)) {
    return (
      <main className="flex max-w-[720px] flex-col gap-6 p-10">
        <PageHeader title="Audit log" />
        <section className="rounded-3xl border border-dashed border-foreground/30 p-8">
          <div className="font-serif text-2xl">Not available yet</div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {UNSUPPORTED_MESSAGE} It needs a route that lists audit events (
            <code>GET /audit-logs</code>) — they&rsquo;re recorded already but
            can&rsquo;t be read.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-10">
      <PageHeader
        title="Audit log"
        aside={
          <button
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv("audit-log.csv", [
                [
                  "Time",
                  "Actor",
                  "Action",
                  "Resource type",
                  "Resource",
                  "Resource id",
                ],
                ...rows.map((e) => [
                  e.createdAt,
                  actorName(e),
                  e.action,
                  e.resourceType,
                  resource(e),
                  e.resourceId,
                ]),
              ])
            }
            className="h-11 rounded-xl border border-foreground px-5 text-sm font-bold disabled:opacity-40"
          >
            Export CSV
          </button>
        }
      />
      <DemoNotice />
      {q.isError && (
        <QueryError error={q.error} retry={() => void q.refetch()} />
      )}
      <div className="flex flex-wrap gap-3">
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setShown(PAGE);
          }}
          placeholder="Search by admin, action, or record…"
        />
        <Select
          aria-label="Filter by admin"
          value={actor}
          onChange={(e) => {
            setActor(e.target.value);
            setShown(PAGE);
          }}
          className="h-11 w-auto min-w-[150px] bg-white"
        >
          <option value="all">All admins</option>
          {actors.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </Select>
        <Select
          aria-label="Filter by action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setShown(PAGE);
          }}
          className="h-11 w-auto min-w-[170px] bg-white"
        >
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABEL[a] ?? humanise(a)}
            </option>
          ))}
        </Select>
      </div>
      <section className="rounded-3xl bg-white px-7 py-2">
        {q.isPending && (
          <p className="py-6 text-sm text-muted">Loading activity…</p>
        )}
        {q.isSuccess && rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            No activity matches.
          </p>
        )}
        <ul>
          {rows.slice(0, shown).map((e) => {
            const link =
              e.resourceType === "ServiceRequest" && requests.has(e.resourceId)
                ? `/service-requests/${e.resourceId}`
                : null;
            const who = actorName(e);
            const text = sentence(e);
            const head = text.slice(who.length);
            return (
              <li
                key={e._id}
                className="flex gap-6 border-b border-border py-4 text-sm last:border-0"
              >
                <time
                  dateTime={e.createdAt}
                  className="w-32 shrink-0 text-xs text-muted"
                >
                  {formatDateTime(e.createdAt)}
                </time>
                <p>
                  <strong>{who}</strong>
                  {link ? (
                    <>
                      {head.slice(0, head.length - resource(e).length)}
                      <Link to={link} className="text-link underline">
                        {resource(e)}
                      </Link>
                    </>
                  ) : (
                    head
                  )}
                </p>
              </li>
            );
          })}
        </ul>
        {rows.length > shown && (
          <div className="pb-4 pt-2 text-center">
            <button
              onClick={() => setShown((n) => n + PAGE)}
              className="text-sm font-semibold text-link underline"
            >
              Load earlier activity
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
