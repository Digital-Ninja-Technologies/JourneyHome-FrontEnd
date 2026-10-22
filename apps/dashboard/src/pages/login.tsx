import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/auth-context";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/login" });
  const from = search.redirect || "/app";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await login(
        String(data.get("email")).trim(),
        String(data.get("password")),
        data.get("remember") === "on",
      );
      navigate({ to: from as any, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Welcome{" "}
          <span className="font-serif font-normal italic text-link">
            back.
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-status-paused">
          Log in to see your plans, payments, and upcoming services.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[20px] bg-card p-7 shadow-sm">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-status-paused">
              <input type="checkbox" name="remember" /> Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-bold text-link underline"
            >
              Forgot password?
            </Link>
          </div>
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
          {busy ? "Logging in…" : "Log in"}
        </Button>
        <div className="text-center text-[13px] text-status-paused">
          New to Journey Home?{" "}
          <Link to="/signup" className="font-bold text-link underline">
            Create an account
          </Link>
        </div>
        </form>
    </>
  );
}
