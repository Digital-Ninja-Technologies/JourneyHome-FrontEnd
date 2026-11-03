import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import {
  FormCheckbox,
  FormInput,
  FormPasswordInput,
} from "@journeyhome/ui/components/form-fields";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { env } from "#/env/client";
import { useSignupMutation } from "../mutations";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
});

type SignupFormValues = z.infer<typeof formSchema>;

export function SignupForm() {
  const signupMutation = useSignupMutation();

  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "customer",
    });
  };

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Create your{" "}
          <span className="font-serif font-normal italic text-link">
            account.
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Takes about two minutes. You'll set up your first plan right after.
        </p>
      </div>
      <div className="flex w-full flex-col gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4 rounded-[20px] bg-card p-7 shadow-sm">
            <FormInput
              control={control}
              name="name"
              label="Full name"
              autoComplete="name"
              placeholder="e.g. Chidi Okafor"
            />
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              showCriteria
            />
            <FormCheckbox
              control={control}
              name="terms"
              label={
                <span>
                  I agree to the{" "}
                  <a
                    href={`${env.VITE_MARKETING_URL}/terms`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-link underline"
                  >
                    terms &amp; conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href={`${env.VITE_MARKETING_URL}/privacy`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-link underline"
                  >
                    privacy policy
                  </a>
                  .
                </span>
              }
            />
            {signupMutation.error && (
              <p
                role="alert"
                className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
              >
                {signupMutation.error instanceof Error
                  ? signupMutation.error.message
                  : "Signup failed"}
              </p>
            )}
          </section>
          <Button
            type="submit"
            size="lg"
            disabled={signupMutation.isPending}
            className="h-[52px] rounded-[14px]"
          >
            {signupMutation.isPending ? (
              "Creating account..."
            ) : (
              <span className="inline-flex items-center gap-2">
                Continue <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
          <div className="text-center text-[13px] text-status-paused">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-link underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
