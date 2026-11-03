import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSubmissionSchema,
  contactTopics,
} from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@journeyhome/ui/components/form-fields";
import { Label } from "@journeyhome/ui/components/label";
import { cn } from "@journeyhome/ui/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { CONTACT_EMAIL } from "@/lib/config";
import { useSubmitContact } from "../contact.mutations";

const formSchema = contactSubmissionSchema.extend({
  website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const [honeypotTrapped, setHoneypotTrapped] = React.useState(false);
  const submitMutation = useSubmitContact();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      topic: contactTopics[0],
      message: "",
      website: "",
    },
  });

  const selectedTopic = useWatch({
    control: form.control,
    name: "topic",
  });

  const onSubmit = async (values: FormValues) => {
    if (values.website) {
      setHoneypotTrapped(true);
      return;
    }

    submitMutation.mutate({
      name: values.name,
      phone: values.phone,
      email: values.email,
      topic: values.topic,
      message: values.message,
    });
  };

  const isSuccess = honeypotTrapped || submitMutation.isSuccess;
  const isSubmitting = form.formState.isSubmitting || submitMutation.isPending;

  const handleReset = () => {
    setHoneypotTrapped(false);
    submitMutation.reset();
    form.reset({
      name: "",
      phone: "",
      email: "",
      topic: contactTopics[0],
      message: "",
      website: "",
    });
  };

  if (isSuccess) {
    const referenceId = submitMutation.data?.id || submitMutation.data?._id;
    return (
      <div className="flex flex-col items-center justify-center gap-5 rounded-[28px] border border-border bg-white p-10 text-center shadow-xs">
        <div className="grid size-14 place-items-center rounded-full bg-status-active-bg text-status-active">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Message received!
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Thank you for reaching out. A member of our team will review your
            inquiry and respond within one business day.
          </p>
          {referenceId && (
            <span className="text-xs text-muted/80">
              Reference ID: {referenceId}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="mt-2 rounded-full px-6"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-[28px] border border-border bg-white p-8 shadow-xs"
    >
      {/* Honeypot field for bot trapping */}
      <div
        className="pointer-events-none absolute left-[-9999px] top-auto h-0 w-0 select-none overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="contact-website" tabIndex={-1}>
          Website
        </label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
        />
      </div>

      {submitMutation.isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
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
        <FormInput
          control={form.control}
          name="name"
          label="Full name"
          placeholder="e.g. Adaeze Nwosu"
          disabled={isSubmitting}
        />
        <FormInput
          control={form.control}
          name="phone"
          label="Phone number"
          type="tel"
          placeholder="e.g. +2348012345678"
          disabled={isSubmitting}
        />
      </div>

      <FormInput
        control={form.control}
        name="email"
        type="email"
        label="Email address"
        placeholder="you@email.com"
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted">
          What&rsquo;s this about?
        </Label>
        <div className="flex flex-wrap gap-2">
          {contactTopics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={selectedTopic === t}
              onClick={() => form.setValue("topic", t, { shouldValidate: true })}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95",
                selectedTopic === t
                  ? "border-foreground bg-foreground text-primary-foreground shadow-xs"
                  : "border-border bg-canvas hover:border-foreground/40",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {form.formState.errors.topic && (
          <span className="text-xs text-destructive font-medium">
            {form.formState.errors.topic.message}
          </span>
        )}
      </div>

      <FormTextarea
        control={form.control}
        name="message"
        label="Message"
        rows={5}
        placeholder="Tell us a little about what you need..."
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-[52px] rounded-full text-base font-semibold"
      >
        {isSubmitting ? (
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
