import { zodResolver } from "@hookform/resolvers/zod";
import { type AdminLoginInput, adminLoginSchema } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { FieldGroup } from "@journeyhome/ui/components/field";
import {
  FormInput,
  FormPasswordInput,
} from "@journeyhome/ui/components/form-fields";
import { useSearch } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { env } from "@/env/client";
import { useLoginMutation } from "../mutations";

/** Dark-surface overrides for the shared light form fields. */
const darkField =
  "border-canvas/15 bg-sidebar text-canvas placeholder:text-canvas/40";

export function LoginForm() {
  const { redirect } = useSearch({ from: "/_auth/login" });
  const loginMutation = useLoginMutation();

  const { control, handleSubmit } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((data) =>
        loginMutation.mutate({ ...data, redirect }),
      )}
      className="flex w-full flex-col gap-8"
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

      <FieldGroup className="gap-4 rounded-3xl border border-canvas/10 bg-[#1d1811] p-7 [&_[data-slot=field-label]]:text-xs [&_[data-slot=field-label]]:font-bold [&_[data-slot=field-label]]:uppercase [&_[data-slot=field-label]]:tracking-wider [&_[data-slot=field-label]]:text-canvas/60">
        <FormInput
          control={control}
          name="email"
          type="email"
          label="Work email"
          autoComplete="username"
          placeholder="you@journeyhome.ng"
          className={darkField}
        />
        <FormPasswordInput
          control={control}
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className={darkField}
        />
        {loginMutation.error && (
          <p
            role="alert"
            className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
          >
            {loginMutation.error.message || "Sign in failed"}
          </p>
        )}
      </FieldGroup>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={loginMutation.isPending}
        className="h-[52px] rounded-2xl"
      >
        {loginMutation.isPending ? (
          <>
            <LoaderCircleIcon className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      <p className="text-center text-xs text-canvas/50">
        Not staff?{" "}
        <a href={env.VITE_MARKETING_URL} className="underline">
          Go to the main site
        </a>
      </p>
    </form>
  );
}
