import { Button } from "@journeyhome/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@journeyhome/ui/components/dialog";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Switch } from "@journeyhome/ui/components/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/demo-notice";
import {
  api,
  isUnsupported,
  UNSUPPORTED_MESSAGE,
} from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { formatMonthYearLong, initials } from "@/lib/format";
import {
  type Me,
  type SavedCard,
  useMe,
  useSavedCards,
} from "@/lib/queries";
import { useLogoutMutation } from "@/modules/auth/mutations";
import { useSessionUser } from "@/modules/auth/query-options";

const card = "flex flex-col gap-6 rounded-[28px] bg-white p-7";
const h2 = "font-serif text-[28px] font-normal";
const errCls =
  "rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled";

function explain(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong. Please try again.";
}

function PersonalInfo({ me }: { me?: Me }) {
  const user = useSessionUser();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: (body: { name?: string; phone?: string; email?: string }) =>
      api<Me>("/auth/me", { method: "PATCH", body }),
    onSuccess: (updated) => {
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      try {
        const raw = localStorage.getItem("jh_session");
        if (raw) {
          const s = JSON.parse(raw);
          s.user = {
            ...s.user,
            name: updated.name,
            email: updated.email,
          };
          localStorage.setItem("jh_session", JSON.stringify(s));
        }
      } catch {
        /* ignore */
      }
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    save.mutate({
      name: String(d.get("name") ?? "").trim(),
      phone: String(d.get("phone") ?? "").trim() || undefined,
      email: String(d.get("email") ?? "").trim(),
    });
  }

  const name = me?.name ?? user?.name ?? "";

  return (
    <form onSubmit={onSubmit} className={card}>
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#A9C4B0] text-lg font-bold text-foreground">
          {initials(name)}
        </span>
        <div>
          <h2 className={h2}>{name}</h2>
          {me && (
            <div className="text-[13px] text-muted">
              Member since {formatMonthYearLong(me.createdAt)}
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            required
            minLength={2}
            defaultValue={name}
            autoComplete="name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={me?.phone ?? ""}
            autoComplete="tel"
            placeholder="+234 800 000 0000"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={me?.email ?? user?.email ?? ""}
            autoComplete="email"
          />
        </div>
      </div>
      {save.isError && (
        <p role="alert" className={errCls}>
          {explain(save.error)}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={save.isPending}
          className="rounded-xl"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="text-[13px] font-semibold text-status-active">
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}

function PaymentMethod() {
  const cardsQ = useSavedCards();
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/app/profile" });
  const navigate = useNavigate({ from: "/app/profile" });
  const justAdded = search.card_added === "1";

  const add = useMutation({
    mutationFn: () =>
      api<{ authorizationUrl: string }>("/payments/methods/setup", {
        method: "POST",
      }),
    onSuccess: ({ authorizationUrl }) => {
      window.location.href = authorizationUrl;
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/payments/methods/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  const unsupported = isUnsupported(cardsQ.error);
  return (
    <section className={card}>
      <div className="flex items-end justify-between">
        <h2 className={h2}>Payment method</h2>
        {!unsupported && (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => add.mutate()}
            disabled={add.isPending}
            className="h-auto p-0 text-sm font-semibold text-link hover:text-link-hover"
          >
            {add.isPending ? "Opening…" : "Add new"}
          </Button>
        )}
      </div>
      {justAdded && (
        <p className="flex items-center justify-between rounded-xl bg-status-active-bg px-3.5 py-2 text-[13px] text-status-active">
          <span>Card added.</span>
          <button
            type="button"
            className="font-bold underline cursor-pointer"
            onClick={() => navigate({ search: {}, replace: true })}
          >
            Dismiss
          </button>
        </p>
      )}
      {cardsQ.isPending && <p className="text-sm text-muted">Loading…</p>}
      {unsupported && (
        <p className="rounded-xl bg-cream px-3.5 py-3 text-[13px] text-status-due">
          {UNSUPPORTED_MESSAGE} Saved cards will appear here once it&rsquo;s
          enabled.
        </p>
      )}
      {cardsQ.isError && !unsupported && (
        <p role="alert" className={errCls}>
          {cardsQ.error.message}
        </p>
      )}
      {cardsQ.isSuccess && cardsQ.data.length === 0 && (
        <p className="text-sm text-muted">
          No saved card yet. Your card is saved when you make a payment.
        </p>
      )}
      {cardsQ.data?.map((c: SavedCard) => (
        <div
          key={c._id}
          className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-3.5">
            <span className="rounded-md bg-foreground px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-accent">
              {c.brand.toUpperCase()}
            </span>
            <div>
              <div className="text-sm font-bold">Card ending in {c.last4}</div>
              <div className="text-xs text-muted">
                Expires {String(c.expMonth).padStart(2, "0")}/
                {String(c.expYear).slice(-2)}
                {c.isDefault ? " · Default" : ""}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={remove.isPending}
            onClick={() =>
              window.confirm(`Remove the card ending in ${c.last4}?`) &&
              remove.mutate(c._id)
            }
            className="h-auto p-0 text-sm font-semibold text-status-cancelled hover:bg-transparent hover:text-status-cancelled"
          >
            Remove
          </Button>
        </div>
      ))}
    </section>
  );
}

function NotificationPreferences({ me }: { me?: Me }) {
  const queryClient = useQueryClient();
  const prefs = me?.preferences ?? {
    paymentReminders: true,
    deficitAlerts: true,
    serviceUpdates: true,
    productNews: false,
  };

  const update = useMutation({
    mutationFn: (next: typeof prefs) =>
      api<Me>("/auth/me/preferences", { method: "PATCH", body: next }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  function toggle(key: keyof typeof prefs) {
    update.mutate({ ...prefs, [key]: !prefs[key] });
  }

  const items: [keyof typeof prefs, string, string][] = [
    [
      "paymentReminders",
      "Payment reminders",
      "Before a monthly contribution is charged",
    ],
    [
      "deficitAlerts",
      "Deficit alerts",
      "If a monthly charge fails or is missed",
    ],
    [
      "serviceUpdates",
      "Service updates",
      "When a photographer is assigned or documents are approved",
    ],
    [
      "productNews",
      "Journey Home news",
      "Occasional product updates and features",
    ],
  ];

  return (
    <section className={card}>
      <h2 className={h2}>Notification preferences</h2>
      <div className="flex flex-col gap-4">
        {items.map(([key, title, desc]) => (
          <label
            key={key}
            className="flex cursor-pointer items-start justify-between gap-4 py-2"
          >
            <div>
              <div className="text-sm font-bold">{title}</div>
              <div className="text-xs text-muted">{desc}</div>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              aria-label={title}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const change = useMutation({
    mutationFn: (body: Record<string, string>) =>
      api("/auth/me/password", { method: "PATCH", body }),
  });
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-[15px] font-semibold underline cursor-pointer"
        aria-expanded={open}
      >
        Change password{" "}
        <ChevronRight
          className={`size-4 transition ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const d = new FormData(form);
            if (d.get("next") !== d.get("confirm")) return setMismatch(true);
            setMismatch(false);
            change.mutate(
              {
                currentPassword: String(d.get("current")),
                newPassword: String(d.get("next")),
              },
              { onSuccess: () => form.reset() },
            );
          }}
          className="mb-5 flex flex-col gap-3"
        >
          <DemoNotice>
            Any current password works except <strong>wrong</strong>.
          </DemoNotice>
          <Input
            name="current"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Current password"
            aria-label="Current password"
          />
          <Input
            name="next"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="New password (6+ characters)"
            aria-label="New password"
          />
          <Input
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Confirm new password"
            aria-label="Confirm new password"
          />
          {(mismatch || change.isError) && (
            <p role="alert" className={errCls}>
              {mismatch
                ? "Those passwords don't match."
                : explain(change.error)}
            </p>
          )}
          {change.isSuccess && (
            <p className="text-[13px] font-semibold text-status-active">
              Password changed.
            </p>
          )}
          <Button
            type="submit"
            disabled={change.isPending}
            className="self-start rounded-xl"
          >
            {change.isPending ? "Saving…" : "Update password"}
          </Button>
        </form>
      )}
    </div>
  );
}

function CloseAccount() {
  const logoutMutation = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const close = useMutation({
    mutationFn: () => api("/auth/me", { method: "DELETE" }),
    onSuccess: () => {
      logoutMutation.mutate();
    },
  });
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between border-t border-border py-4 text-[15px] font-semibold text-status-cancelled underline cursor-pointer"
      >
        Close account <ChevronRight className="size-4" />
      </button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setTyped("");
        }}
      >
        <DialogContent className="max-w-md gap-5 rounded-3xl p-7">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-normal">
              Close your account?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted">
              Closing your account cancels any running plans and removes your
              saved payment details. Active services currently in progress will
              remain on file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type-delete">
              Type <strong className="text-foreground">DELETE</strong> to
              confirm
            </Label>
            <Input
              id="type-delete"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          {close.isError && (
            <p role="alert" className={errCls}>
              {explain(close.error)}
            </p>
          )}
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Never mind
            </Button>
            <Button
              variant="destructive"
              disabled={typed !== "DELETE" || close.isPending}
              onClick={() => close.mutate()}
            >
              {close.isPending ? "Closing…" : "Close my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Security() {
  return (
    <section className={card}>
      <h2 className={h2}>Security &amp; access</h2>
      <div>
        <ChangePassword />
        <CloseAccount />
      </div>
    </section>
  );
}

export function ProfileView() {
  const meQ = useMe();
  const me = meQ.data;

  return (
    <main className="flex max-w-[760px] flex-col gap-6 p-5 md:p-10">
      <header>
        <div className="text-sm text-muted">
          <Link to="/app" className="hover:underline">
            Dashboard
          </Link>{" "}
          / Profile
        </div>
        <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">
          Profile &amp; <span className="italic">settings</span>
        </h1>
      </header>

      <PersonalInfo me={me} />
      <PaymentMethod />
      <NotificationPreferences me={me} />
      <Security />
    </main>
  );
}

export default ProfileView;
