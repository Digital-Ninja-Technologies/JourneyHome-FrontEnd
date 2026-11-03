import {
  type ContactTopic,
  contactSubmissionSchema,
  contactTopics,
} from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { cn } from "@journeyhome/ui/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/config";
import { useSubmitContact } from "../contact.mutations";

export function ContactForm() {
  const [topic, setTopic] = useState<ContactTopic>(contactTopics[0]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitMutation = useSubmitContact();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || "") || undefined,
      email: String(formData.get("email") || ""),
      topic,
      message: String(formData.get("message") || ""),
    };

    const parsed = contactSubmissionSchema.safeParse(rawData);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === "string" && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    submitMutation.mutate(parsed.data);
  }

  if (submitMutation.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-[28px] border border-border bg-white p-10 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-status-active-bg text-status-active">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-extrabold tracking-tight">
            Message received!
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Thank you for reaching out. A member of our team will review your
            inquiry and respond within one business day.
          </p>
          {submitMutation.data?.id && (
            <span className="text-xs text-muted/70">
              Reference ID: {submitMutation.data.id}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            submitMutation.reset();
            setFieldErrors({});
          }}
          className="mt-2 rounded-full px-6"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-[28px] border border-border bg-white p-8"
    >
      {submitMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Unable to send message right now.</p>
          <p className="mt-1">
            Please try again or email us directly at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-bold">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="e.g. Adaeze Nwosu"
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <span className="text-xs text-red-600 font-medium">
              {fieldErrors.name}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="e.g. 0801 234 5678"
            aria-invalid={!!fieldErrors.phone}
          />
          {fieldErrors.phone && (
            <span className="text-xs text-red-600 font-medium">
              {fieldErrors.phone}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <span className="text-xs text-red-600 font-medium">
            {fieldErrors.email}
          </span>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          What&rsquo;s this about?
        </legend>
        <div className="flex flex-wrap gap-2">
          {contactTopics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer",
                topic === t
                  ? "border-foreground bg-foreground text-canvas"
                  : "border-border bg-canvas hover:border-foreground/40",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {fieldErrors.topic && (
          <span className="text-xs text-red-600 font-medium">
            {fieldErrors.topic}
          </span>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little about what you need..."
          aria-invalid={!!fieldErrors.message}
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-accent"
        />
        {fieldErrors.message && (
          <span className="text-xs text-red-600 font-medium">
            {fieldErrors.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitMutation.isPending}
        className="h-[52px] rounded-full"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending message...
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
