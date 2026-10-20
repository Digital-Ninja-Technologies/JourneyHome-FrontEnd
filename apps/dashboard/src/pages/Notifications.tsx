import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Bell, Camera, Check, CreditCard } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";
import { useAuth } from "../auth/AuthContext";
import { describeNotification, formatNotificationTime, readSeen, writeSeen, type NoteTone } from "../lib/notifications";
import { MARKETING_URL } from "../lib/plans";
import { useNotifications, usePlans } from "../lib/queries";

const TONE: Record<NoteTone, { icon: typeof Bell; box: string }> = {
  success: { icon: Check, box: "bg-status-active-bg text-status-active" },
  due: { icon: CreditCard, box: "bg-cream text-status-due" },
  alert: { icon: AlertCircle, box: "bg-status-cancelled-bg text-status-cancelled" },
  service: { icon: Camera, box: "bg-status-approved-bg text-status-approved" },
  info: { icon: Bell, box: "bg-status-review-bg text-status-review" },
};

export default function Notifications() {
  const { user } = useAuth();
  const notesQ = useNotifications();
  const plansQ = usePlans();
  const [seen, setSeen] = useState(() => (user ? readSeen(user.id) : null));

  const plans = new Map((plansQ.data ?? []).map((p) => [p._id, p]));
  const notes = [...(notesQ.data ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const isUnread = (iso: string) => !seen || new Date(iso) > new Date(seen);
  const unread = notes.filter((n) => isUnread(n.createdAt)).length;

  function markAllRead() {
    if (!user) return;
    const now = new Date().toISOString();
    writeSeen(user.id, now);
    setSeen(now);
  }

  return (
    <main className="flex flex-col gap-6 p-5 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted">
            <Link to="/app" className="hover:underline">Dashboard</Link> / Notifications
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">Notifications</h1>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="pt-3 text-sm font-semibold text-link hover:text-link-hover">
            Mark all as read ({unread})
          </button>
        )}
      </header>

      {notesQ.isPending && <p className="text-muted">Loading your notifications…</p>}
      {notesQ.isError && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled">
          <span>We couldn&rsquo;t load your notifications. {notesQ.error.message}</span>
          <button className="font-bold underline" onClick={() => void notesQ.refetch()}>Try again</button>
        </div>
      )}
      {notesQ.isSuccess && notes.length === 0 && (
        <div className="rounded-3xl border border-dashed border-foreground/30 p-8">
          <div className="font-serif text-2xl">Nothing yet</div>
          <p className="mt-1 text-sm text-muted">We&rsquo;ll keep you posted here about payments and service updates.</p>
        </div>
      )}

      {notes.length > 0 && (
        <ul className="rounded-3xl bg-white px-7 py-2">
          {notes.map((n) => {
            const view = describeNotification(n, n.plan ? plans.get(n.plan) : undefined);
            const { icon: Icon, box } = TONE[view.tone];
            const unreadNow = isUnread(n.createdAt);
            return (
              <li key={n._id} className="flex items-start gap-4 border-b border-border py-5 last:border-0">
                <span className={cn("mt-5 size-2 shrink-0 rounded-full", unreadNow ? "bg-accent" : "bg-transparent")} aria-label={unreadNow ? "Unread" : undefined} />
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", box)}><Icon className="size-[18px]" /></span>
                <div className="min-w-0">
                  <div className={cn("text-[15px]", unreadNow ? "font-bold" : "font-semibold")}>{view.title}</div>
                  <div className="text-sm leading-relaxed text-ink-soft">
                    {view.body}{" "}
                    {view.link && <Link to={view.link.to} className="font-semibold text-link underline">{view.link.label}</Link>}
                    {view.policy && <> <a href={`${MARKETING_URL}/terms`} className="font-semibold text-link underline">Read the policy</a></>}
                  </div>
                  <div className="mt-1 text-xs text-muted">{formatNotificationTime(n.createdAt)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
