import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import {
  FormInput,
  FormPasswordInput,
} from "@journeyhome/ui/components/form-fields";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { env } from "#/env/client";
import { resolveSelectedPackage } from "@/lib/search-schemas";
import { setStoredSelectedPackage } from "@/modules/onboarding/storage";
import { useSignupMutation } from "../mutations";

// Matches the backend/schema rule (min 6 characters).
const PASSWORD_CRITERIA = [
  { label: "At least 6 characters", regex: /^.{6,}$/ },
  { label: "At least one uppercase letter", regex: /[A-Z]/ },
];

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof formSchema>;

export function SignupForm() {
  const signupMutation = useSignupMutation();
  const search = useSearch({ from: "/signup/" });

  useEffect(() => {
    const fromUrl = resolveSelectedPackage(search);
    if (fromUrl) setStoredSelectedPackage(fromUrl);
  }, [search]);

  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
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
        <p className="text-sm leading-relaxed text-muted-foreground">
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
              criteria={PASSWORD_CRITERIA}
            />
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
        <p className="px-6 text-center text-xs leading-relaxed text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a
            href={`${env.VITE_MARKETING_URL}/terms`}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a
            href={`${env.VITE_MARKETING_URL}/privacy`}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
