import { env } from "#/env/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSignupMutation } from "../mutations";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
});

type SignupFormValues = z.infer<typeof formSchema>;

export function SignupForm() {
  const signupMutation = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      terms: false,
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "customer",
      phone: data.phone?.trim() || undefined,
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="e.g. Chidi Okafor"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-status-cancelled">
                  {errors.name.message}
                </p>
              )}
            </div>
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
              <Label htmlFor="phone">Phone number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234 800 000 0000"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-status-cancelled">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-status-cancelled">
                  {errors.password.message}
                </p>
              )}
            </div>
            <label className="flex items-start gap-2 text-[13px] text-status-paused">
              <input
                type="checkbox"
                className="mt-0.5"
                {...register("terms")}
              />
              <span>
                I agree to the{" "}
                <a
                  href={`${env.VITE_MARKETING_URL}/terms`}
                  className="font-bold text-link underline"
                >
                  terms &amp; conditions
                </a>{" "}
                and{" "}
                <a
                  href={`${env.VITE_MARKETING_URL}/privacy`}
                  className="font-bold text-link underline"
                >
                  privacy policy
                </a>
                .
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-status-cancelled">
                {errors.terms.message}
              </p>
            )}
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
            {signupMutation.isPending ? "Creating account…" : "Continue →"}
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
