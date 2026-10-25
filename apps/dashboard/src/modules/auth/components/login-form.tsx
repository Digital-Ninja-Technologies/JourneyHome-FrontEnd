import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { loginSchema } from "@journeyhome/schemas";
import { Link, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useLoginMutation } from "../mutations";

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormOutput = z.output<typeof loginSchema>;

export function LoginForm() {
  const search = useSearch({ from: "/_auth/login" });
  const redirectTarget = search.redirect || "/app";
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput, any, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = (data: LoginFormOutput) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      remember: data.remember,
      redirect: redirectTarget,
    });
  };

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[20px] bg-card p-7 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-status-cancelled">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-status-cancelled">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-status-paused">
              <input type="checkbox" {...register("remember")} /> Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-bold text-link underline"
            >
              Forgot password?
            </Link>
          </div>
          {loginMutation.error && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Login failed"}
            </p>
          )}
        </section>
        <Button
          type="submit"
          size="lg"
          disabled={loginMutation.isPending}
          className="h-[52px] rounded-[14px]"
        >
          {loginMutation.isPending ? "Logging in…" : "Log in"}
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
