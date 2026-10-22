import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "../components/ContactForm";
import { Accent, Container, PageHero } from "../components/Section";
import { CONTACT_EMAIL } from "../lib/config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact · Journey Home",
      },
    ],
  }),
  component: Contact,
});

const INFO = [
  { icon: Mail, title: "Email us", body: CONTACT_EMAIL, tint: "bg-accent/[0.16] text-accent", dark: true },
  { icon: Phone, title: "Call us", body: "+234 701 234 5678", tint: "bg-status-active-bg text-status-active" },
  { icon: MapPin, title: "Visit us", body: "12 Admiralty Way, Lekki, Lagos", tint: "bg-cream text-link" },
  { icon: Clock, title: "Office hours", body: "Mon – Sat, 8am – 7pm WAT", tint: "bg-[#E9EFEA] text-[#2F7D5B]" },
];

function Contact() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        intro="Questions about a plan, a payment, or a service in progress — reach out and our team will get back to you within a day."
      >
        We&rsquo;re here to <Accent>help.</Accent>
      </PageHero>
      <Container className="grid gap-10 pb-12 md:grid-cols-[1.4fr_1fr]">
        <ContactForm />
        <div className="flex flex-col gap-4">
          {INFO.map(({ icon: Icon, title, body, tint, dark }) => (
            <div
              key={title}
              className={
                dark
                  ? "flex items-center gap-4 rounded-3xl bg-foreground p-7 text-canvas"
                  : "flex items-center gap-4 rounded-3xl border border-border bg-white p-7"
              }
            >
              <div className={`grid size-11 flex-shrink-0 place-items-center rounded-xl ${tint}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-canvas/60" : "text-muted"}`}>{title}</div>
                <div className="mt-1 text-[16px] font-bold">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
      <Container className="pb-24">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-foreground px-10 py-12">
          <div>
            <div className="text-[28px] font-extrabold tracking-tight text-canvas">Looking for a quick answer?</div>
            <div className="mt-1.5 text-[15px] text-canvas/70">Check our frequently asked questions first.</div>
          </div>
          <Link to="/faq" className="inline-flex h-[52px] flex-shrink-0 items-center rounded-full bg-accent px-7 text-sm font-extrabold text-foreground">
            Visit FAQ
          </Link>
        </div>
      </Container>
    </main>
  );
}
