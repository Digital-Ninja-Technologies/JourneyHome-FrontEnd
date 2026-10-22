import { Button } from "@journeyhome/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@journeyhome/ui/components/dialog";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Switch } from "@journeyhome/ui/components/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DemoNotice } from "@/components/demo-notice";
import { useAuth } from "../auth/auth-context";
import { api, isUnsupported, UNSUPPORTED_MESSAGE } from "../lib/api";
import { formatMonthYearLong, initials } from "../lib/format";
import { MARKETING_URL } from "../lib/plans";
import { type Me, type SavedCard, useMe, useSavedCards } from "../lib/queries";

const card = "flex flex-col gap-5 rounded-[28px] bg-white p-7";
const h2 = "font-serif text-[28px] font-normal";
const errCls =
  "rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled";
const explain = (e: unknown) =>
  isUnsupported(e)
    ? `${UNSUPPORTED_MESSAGE} This part of the server isn't enabled yet.`
    : (e as Error).message;

const PREFS: { key: keyof Me["preferences"]; title: string; body: string }[] = [
  {
    key: "paymentReminders",
    title: "Payment reminders",
    body: "Get a reminder a few days before a payment is due.",
  },
  {
    key: "deficitAlerts",
    title: "Deficit alerts",
    body: "Get notified when a payment is missed and recorded as a deficit.",
  },
  {
    key: "serviceUpdates",
    title: "Service request updates",
    body: "Updates on assignment and coordination for a requested service.",
  },
  {
    key: "productNews",
    title: "Product news & offers",
    body: "Occasional updates about new packages or features.",
  },
];

function PersonalInfo({ me }: { me?: Me }) {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const save = useMutation({
    mutationFn: (body: Record<string, string>) =>
      api<Me>("/auth/me", { method: "PATCH", body }),
    onSuccess: (_d, body) => {
      setSaved(true);
      updateUser({ name: body.name, email: body.email });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const name = me?.name ?? user?.name ?? "";

  return (
    <form
      key={me?.id ?? "loading"}
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        setSaved(false);
        save.mutate({
          name: String(d.get("name")).trim(),
          phone: String(d.get("phone")).trim(),
          email: String(d.get("email")).trim(),
        });
      }}
      className={card}
    >
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-foreground font-serif text-xl text-accent">
          {initials(name)}
        </span>
        <div>
          <div className="font-bold">{name}</div>
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

function PaymentMethods() {
  const cardsQ = useSavedCards();
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/app/profile" });
  const search = useSearch({ from: "/app/profile" });
  const refresh = useCallback(
    () => void queryClient.invalidateQueries({ queryKey: ["cards"] }),
    [queryClient],
  );

  const remove = useMutation({
    mutationFn: (id: string) =>
      api(`/payments/methods/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
  });
  // Saving a card goes through Paystack, which returns here with ?card_added=1.
  const add = useMutation({
    mutationFn: () =>
      api<{ authorizationUrl: string }>("/payments/methods/initialize", {
        method: "POST",
      }),
    onSuccess: (d) => window.location.assign(d.authorizationUrl),
  });
  const justAdded = search.card_added === "1";
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial mount refresh
  useEffect(() => {
    if (justAdded) refresh();
  }, [justAdded, refresh]);

  const unsupported = isUnsupported(cardsQ.error);
  return (
    <section className={card}>
      <div className="flex items-end justify-between">
        <h2 className={h2}>Payment method</h2>
        {!unsupported && (
          <button
            onClick={() => add.mutate()}
            disabled={add.isPending}
            className="text-sm font-semibold text-link hover:text-link-hover"
          >
            {add.isPending ? "Opening…" : "Add new"}
          </button>
        )}
      </div>
      {justAdded && (
        <p className="rounded-xl bg-status-active-bg px-3.5 py-2 text-[13px] text-status-active">
          Card added.{" "}
          <button
            className="font-bold underline"
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
          <button
            disabled={remove.isPending}
            onClick={() =>
              window.confirm(`Remove the card ending in ${c.last4}?`) &&
              remove.mutate(c._id)
            }
            className="text-sm font-semibold text-status-cancelled"
          >
            Remove
          </button>
        </div>
      ))}
      {(add.isError || remove.isError) && (
        <p role="alert" className={errCls}>
          {explain(add.error ?? remove.error)}
        </p>
      )}
    </section>
  );
}

function Notifications({ me }: { me?: Me }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const prefs = me?.preferences;
  const toggle = useMutation({
    mutationFn: (patch: Partial<Me["preferences"]>) =>
      api("/auth/me/preferences", { method: "PATCH", body: patch }),
    onMutate: async (patch) => {
      setError(null);
      await queryClient.cancelQueries({ queryKey: ["me"] });
      const prev = queryClient.getQueriesData<Me>({ queryKey: ["me"] });
      queryClient.setQueriesData<Me>({ queryKey: ["me"] }, (m) =>
        m ? { ...m, preferences: { ...m.preferences, ...patch } } : m,
      );
      return { prev };
    },
    onError: (e, _p, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      setError(explain(e));
    },
  });

  return (
    <section className={card}>
      <h2 className={h2}>Notification preferences</h2>
      {!prefs && (
        <p className="text-sm text-muted">
          Preferences will appear here once your profile has loaded.
        </p>
      )}
      {prefs &&
        PREFS.map((p) => (
          <div
            key={p.key}
            className="flex items-center justify-between gap-6 border-t border-border pt-5 first:border-0 first:pt-0"
          >
            <div>
              <div className="text-[15px] font-bold">{p.title}</div>
              <div className="text-[13px] text-muted">{p.body}</div>
            </div>
            <Switch
              checked={prefs[p.key]}
              label={p.title}
              onCheckedChange={(v) => toggle.mutate({ [p.key]: v })}
            />
          </div>
        ))}
      {error && (
        <p role="alert" className={errCls}>
          {error}
        </p>
      )}
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
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-[15px] font-semibold underline"
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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const close = useMutation({
    mutationFn: () => api("/auth/me", { method: "DELETE" }),
    onSuccess: () => {
      logout();
      navigate({ to: "/login", replace: true });
    },
  });
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between border-t border-border py-4 text-[15px] font-semibold text-status-cancelled underline"
      >
        Close account <ChevronRight className="size-4" />
      </button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setTyped("");
            close.reset();
          }
        }}
      >
        <DialogContent className="rounded-3xl p-8">
          <DialogTitle className="font-serif text-3xl font-normal">
            Close your account?
          </DialogTitle>
          <DialogDescription>
            This is permanent. If you have active plans or a service in
            progress, please contact us first so we can handle them properly.
          </DialogDescription>
          <Label htmlFor="confirm-close">Type CLOSE to confirm</Label>
          <Input
            id="confirm-close"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
          />
          {close.isError && (
            <p role="alert" className={errCls}>
              {explain(close.error)}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={typed !== "CLOSE" || close.isPending}
              onClick={() => close.mutate()}
              className="bg-status-cancelled text-white hover:bg-status-cancelled/90"
            >
              {close.isPending ? "Closing…" : "Close my account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Profile() {
  const meQ = useMe();
  return (
    <main className="flex max-w-[820px] flex-col gap-6 p-5 md:p-10">
      <header>
        <div className="text-sm text-muted">
          <Link to="/app" className="hover:underline">
            Dashboard
          </Link>{" "}
          / Profile &amp; settings
        </div>
        <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">
          Profile &amp; <span className="italic">settings</span>
        </h1>
      </header>
      <DemoNotice>Changes are saved in this browser only.</DemoNotice>
      {meQ.isError && isUnsupported(meQ.error) && (
        <p className="rounded-2xl bg-cream px-4 py-3 text-[13px] text-status-due">
          {UNSUPPORTED_MESSAGE} Your details are shown from your login, and
          saving changes isn&rsquo;t enabled yet.
        </p>
      )}
      {meQ.isError && !isUnsupported(meQ.error) && (
        <p role="alert" className={errCls}>
          {meQ.error.message}
        </p>
      )}
      <PersonalInfo me={meQ.data} />
      <PaymentMethods />
      <Notifications me={meQ.data} />
      <section className={card}>
        <h2 className={h2}>Account</h2>
        <div>
          <ChangePassword />
          <a
            href={`${MARKETING_URL}/terms`}
            className="flex items-center justify-between border-t border-border py-4 text-[15px] font-semibold underline"
          >
            Plan terms &amp; conditions <ChevronRight className="size-4" />
          </a>
          <a
            href={`${MARKETING_URL}/privacy`}
            className="flex items-center justify-between border-t border-border py-4 text-[15px] font-semibold underline"
          >
            Privacy policy <ChevronRight className="size-4" />
          </a>
          <CloseAccount />
        </div>
      </section>
    </main>
  );
}
