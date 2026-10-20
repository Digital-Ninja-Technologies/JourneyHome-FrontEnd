import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { useAuth } from "../auth/AuthContext";
import { AuthShell } from "../components/AuthShell";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/app";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await login(String(data.get("email")).trim(), String(data.get("password")), data.get("remember") === "on");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome" accent="back." subtitle="Log in to see your plans, payments, and upcoming services.">
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[20px] bg-card p-7 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Enter your password" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-status-paused">
              <input type="checkbox" name="remember" /> Remember me
            </label>
            {/* TODO: no backend endpoint for password reset yet; route is not built */}
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">
              {error}
            </p>
          )}
        </section>
        <Button type="submit" size="lg" disabled={busy} className="h-[52px] rounded-[14px]">
          {busy ? "Logging in…" : "Log in"}
        </Button>
        <div className="text-center text-[13px] text-status-paused">
          New to Journey Home?{" "}
          <Link to="/signup" className="font-bold text-link underline">
            Create an account
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
