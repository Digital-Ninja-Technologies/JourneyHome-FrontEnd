import { createFileRoute, Link } from "@tanstack/react-router";
import { Accent, Container, PageHero } from "@/components/section";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () =>
    createPageHead({
      title: "FAQ",
      description:
        "Frequently asked questions about Journey Home savings plans, payments, photographers, and safety.",
      path: "/faq",
    }),
  component: FAQ,
});

const FAQS = [
  [
    "What happens if a payment is missed?",
    "Nothing is forfeited. A missed month is recorded as a deficit on your plan rather than a skipped payment, and you simply clear it at your next convenient payment — alongside your regular contribution, whenever that works for you.",
  ],
  [
    "Can I have more than one plan?",
    "Yes. Many families run a plan each for a parent, grandparent, or other loved one, all tracked separately within one account.",
  ],
  [
    "How are photographers chosen?",
    "We assign from our verified network of 380+ photographers and videographers, matched to your state and the scale of the service, with a profile shared with you ahead of the day.",
  ],
  [
    "Can family abroad see the gallery?",
    "Yes — every package includes a shareable digital gallery, so relatives anywhere in the world can view and download photos and the keepsake film.",
  ],
  [
    "Can I change my package later?",
    "No — the package you choose is fixed once a plan starts. If you'd like a different package, you can close the plan and start a new one at the package you want.",
  ],
  [
    "Is my money safe?",
    "Every contribution is recorded and receipted the moment it's received, and is fully visible in your dashboard — nothing moves without a trace.",
  ],
];

function FAQ() {
  return (
    <main>
      <PageHero eyebrow="FAQ">
        Questions families <Accent>ask us.</Accent>
      </PageHero>
      <Container className="flex max-w-4xl flex-col gap-3 pb-12">
        {FAQS.map(([q, a], i) => (
          <details
            key={q}
            open={i === 0}
            className="group rounded-2xl border border-border bg-white px-7 py-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-bold">
              {q}
              <span
                className="text-xl text-link transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
              {a}
            </p>
          </details>
        ))}
      </Container>
      <Container className="pb-24">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-foreground px-10 py-12">
          <div>
            <div className="text-[28px] font-extrabold tracking-tight text-canvas">
              Still have a question?
            </div>
            <div className="mt-1.5 text-[15px] text-canvas/70">
              Our team usually replies within a day.
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex h-[52px] shrink-0 items-center rounded-full bg-accent px-7 text-sm font-extrabold text-foreground"
          >
            Contact us
          </Link>
        </div>
      </Container>
    </main>
  );
}
