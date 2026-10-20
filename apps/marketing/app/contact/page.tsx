import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "../../components/ContactForm";
import { Accent, Container, PageHero } from "../../components/Section";
import { CONTACT_EMAIL } from "../../lib/config";

export const metadata: Metadata = { title: "Contact" };

const INFO = [
  { icon: Mail, title: "Email us", body: CONTACT_EMAIL },
  { icon: Phone, title: "Call us", body: "+234 701 234 5678" },
  { icon: MapPin, title: "Visit us", body: "12 Admiralty Way, Lekki, Lagos" },
  { icon: Clock, title: "Office hours", body: "Mon – Sat, 8am – 7pm WAT" },
];

export default function Contact() {
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
          {INFO.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-center gap-4 rounded-3xl border border-border bg-white p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-status-active-bg text-status-active">
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-[15px] font-bold">{title}</div>
                <div className="text-sm text-muted">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
      <Container className="pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-sand px-8 py-7">
          <div>
            <div className="text-lg font-bold">Looking for a quick answer?</div>
            <div className="text-sm text-muted">Check our frequently asked questions first.</div>
          </div>
          <a href="/faq" className="inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-bold text-canvas">
            Visit FAQ
          </a>
        </div>
      </Container>
    </main>
  );
}
