import { useState } from "react";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { cn } from "@journeyhome/ui/lib/utils";
import { CONTACT_EMAIL } from "../lib/config";

const TOPICS = ["Starting a plan", "An existing plan", "Photographer network", "Something else"];

// There is no contact endpoint on the backend yet, so submitting opens the visitor's
// email client with the message pre-filled.
export function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = `${d.get("message")}\n\n— ${d.get("name")}\nPhone: ${d.get("phone") || "n/a"}\nEmail: ${d.get("email")}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-[28px] border border-border bg-white p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required autoComplete="name" placeholder="e.g. Adaeze Nwosu" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. 0801 234 5678" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">What&rsquo;s this about?</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold",
                topic === t ? "border-foreground bg-foreground text-canvas" : "border-border bg-canvas",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little about what you need..."
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-accent"
        />
      </div>
      <Button type="submit" size="lg" className="h-[52px] rounded-full">
        Send message
      </Button>
    </form>
  );
}
