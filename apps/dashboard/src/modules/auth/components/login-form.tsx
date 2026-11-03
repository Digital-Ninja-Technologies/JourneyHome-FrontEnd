import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import {
  FormCheckbox,
  FormInput,
  FormPasswordInput,
} from "@journeyhome/ui/components/form-fields";
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

  const { control, handleSubmit } = useForm<
    LoginFormInput,
    any,
    LoginFormOutput
  >({
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

  const isUnverified =
    loginMutation.error &&
    /verify|unverified/i.test(loginMutation.error.message);

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Welcome{" "}
          <span className="font-serif font-normal italic text-link">back.</span>
        </h1>
        <p className="text-sm leading-relaxed text-status-paused">
          Log in to see your plans, payments, and upcoming services.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[20px] bg-card p-7 shadow-sm">
          <FormInput
            control={control}
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FormPasswordInput
            control={control}
            name="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          <div className="flex items-center justify-between">
            <FormCheckbox
              control={control}
              name="remember"
              label="Remember me"
            />
            <Link
              to="/forgot-password"
              className="text-[13px] font-bold text-link underline"
            >
              Forgot password?
            </Link>
          </div>
          {loginMutation.error && (
            <div
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              <p>
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : "Login failed"}
              </p>
              {isUnverified && (
                <p className="mt-1">
                  <Link
                    to="/signup/verify"
                    search={{ redirect: redirectTarget }}
                    className="font-bold underline"
                  >
                    Click here to verify your email →
                  </Link>
                </p>
              )}
            </div>
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

export default LoginForm;
