import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding-shell";
import { useAuth } from "../auth/auth-context";

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already logged in (and not mid-signup): nothing to do here.
  if (user && !busy) return <Navigate to="/app" replace />;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await signup(
        String(data.get("name")).trim(),
        String(data.get("email")).trim(),
        String(data.get("password")),
        String(data.get("phone") ?? "").trim() || undefined,
      );
      navigate({ to: "/signup/verify", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setBusy(false);
    }
  }

  return (
    <OnboardingShell
      step={1}
      title="Create your"
      accent="account."
      subtitle="Takes about two minutes. You'll set up your first plan right after."
      width="max-w-[440px]"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[20px] bg-card p-7 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              autoComplete="name"
              placeholder="e.g. Chidi Okafor"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>
          <label className="flex items-start gap-2 text-[13px] text-status-paused">
            <input type="checkbox" name="terms" required className="mt-0.5" />
            <span>
              I agree to the{" "}
              <a
                href={`${import.meta.env.VITE_MARKETING_URL ?? ""}/terms`}
                className="font-bold text-link underline"
              >
                terms &amp; conditions
              </a>{" "}
              and{" "}
              <a
                href={`${import.meta.env.VITE_MARKETING_URL ?? ""}/privacy`}
                className="font-bold text-link underline"
              >
                privacy policy
              </a>
              .
            </span>
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {error}
            </p>
          )}
        </section>
        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="h-[52px] rounded-[14px]"
        >
          {busy ? "Creating account…" : "Continue →"}
        </Button>
        <div className="text-center text-[13px] text-status-paused">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-link underline">
            Log in
          </Link>
        </div>
      </form>
    </OnboardingShell>
  );
}
