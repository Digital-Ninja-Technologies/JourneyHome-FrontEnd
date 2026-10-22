import { env } from "#/env/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import { adminLoginSchema } from "@journeyhome/schemas";
import { useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useAdminLoginMutation } from "../mutations";

const MARKETING_URL = env.VITE_MARKETING_URL;

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const search = useSearch({ from: "/login" });
  const redirectTarget = search.redirect || "/";
  const loginMutation = useAdminLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: AdminLoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      redirect: redirectTarget,
    });
  };

  const input =
    "h-12 w-full rounded-xl border border-canvas/15 bg-sidebar px-4 text-sm text-canvas placeholder:text-canvas/40 focus-visible:outline-2 focus-visible:outline-accent";
  const label = "text-xs font-bold uppercase tracking-wider text-canvas/60";

  return (
    <div className="flex min-h-screen flex-col items-center bg-sidebar px-6 pt-16 text-canvas">
      <div className="flex flex-col items-center gap-3">
        <span className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
            <path
              d="M16 56 V30 A16 16 0 0 1 48 30 V56"
              fill="none"
              stroke="#FBF9F4"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="40" r="6" fill="#D4A55A" />
            <line
              x1="8"
              y1="56"
              x2="56"
              y2="56"
              stroke="#FBF9F4"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xl font-extrabold tracking-tight">
            Journey Home
          </span>
        </span>
        <span className="rounded-full border border-accent/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[2px] text-accent">
          Admin console
        </span>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 flex w-full max-w-[420px] flex-col gap-8"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-sans text-[32px] font-extrabold tracking-tight">
            Operations{" "}
            <span className="font-serif font-normal italic text-accent">
              sign in.
            </span>
          </h1>
          <p className="text-[13px] text-canvas/60">
            Restricted to Journey Home staff. Access is logged.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-canvas/10 bg-[#1d1811] p-7">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={label}>
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@journeyhome.ng"
              className={input}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-status-cancelled">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className={label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className={input}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-status-cancelled">
                {errors.password.message}
              </p>
            )}
          </div>
          {loginMutation.error && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Sign in failed"}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={loginMutation.isPending}
          className="h-[52px] rounded-2xl"
        >
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-canvas/50">
          Not staff?{" "}
          <a href={MARKETING_URL} className="underline">
            Go to the main site
          </a>
        </p>
      </form>
    </div>
  );
}
