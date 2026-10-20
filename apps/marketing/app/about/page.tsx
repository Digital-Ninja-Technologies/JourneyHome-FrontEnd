import type { Metadata } from "next";
import { Eye, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Photo } from "../../components/Photo";
import { Accent, Container, CtaBand, Eyebrow, PageHero } from "../../components/Section";
import { CONTACT_EMAIL, SIGNUP_URL } from "../../lib/config";
import { images } from "../../lib/images";

export const metadata: Metadata = { title: "About us" };

const VALUES = [
  {
    n: "001",
    icon: Heart,
    title: "We plan for the hardest day, gently.",
    body: "Everything we build assumes the person using it is tired, grieving, or both — so it asks for as little as possible, as kindly as possible.",
  },
  {
    n: "002",
    icon: ShieldCheck,
    title: "Every naira is accountable.",
    body: "No black box. Every contribution is dated, recorded, and receipted the moment it lands — visible in your dashboard, always.",
  },
  {
    n: "003",
    icon: Users,
    title: "We show up on time, every time.",
    body: "A photographer confirmed weeks ahead is worth nothing if they're late on the day. Reliability is the whole job.",
  },
  {
    n: "004",
    icon: Sparkles,
    title: "Dignity isn't a luxury tier.",
    body: "Every package, from Basic to Premium, gets the same verified photographer, the same transparency, and the same care.",
  },
  {
    n: "005",
    icon: Eye,
    title: "We listen before we build.",
    body: "Journey Home is shaped by conversations with families who've been through this — not by guessing what grief needs.",
  },
];

const MILESTONES = [
  ["380+", "Verified photographers & videographers"],
  ["24", "States covered"],
];

export default function About() {
  return (
    <main>
      {/* HERO */}
      <PageHero
        eyebrow="About us"
        intro="Journey Home exists so that when the hardest day comes, your family's only job is to grieve — not to scramble for money, a photographer, or a plan."
        center={false}
      >
        Grief shouldn&rsquo;t come with <Accent>guesswork.</Accent>
      </PageHero>

      {/* HERO IMAGE */}
      <Container className="pb-14">
        <Photo src={images.aboutHero} alt="The Journey Home team" className="h-[400px] w-full rounded-[32px] md:h-[560px]" />
      </Container>

      {/* FOUNDED + MISSION */}
      <Container className="grid gap-10 border-y border-border py-14 md:grid-cols-[1fr_1.6fr]">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[2px] text-link">Founded</div>
          <div className="mt-2 text-[40px] font-extrabold tracking-tight md:text-6xl">2026</div>
        </div>
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[2px] text-link">Our mission</div>
          <p className="mt-2 max-w-2xl text-2xl font-semibold leading-snug tracking-tight">
            To give every Nigerian family a dignified, unhurried way to prepare for a loved one&rsquo;s final service —
            financially and logistically — long before the day arrives.
          </p>
        </div>
      </Container>

      {/* ORIGIN STORY */}
      <Container className="grid gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="flex flex-col gap-5">
          <Eyebrow>Why Journey Home</Eyebrow>
          <h2 className="max-w-lg text-[36px] font-extrabold leading-[1.15] tracking-tight">
            A befitting burial is rarely a shock on cost. It&rsquo;s a shock on timing.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            Families who fully intended to prepare well in advance often find themselves negotiating with a
            photographer at the worst possible moment, in the worst possible state of mind — days after a loss, with
            no energy left to vet a stranger or compare quotes.
          </p>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            Journey Home started with one honest observation: the money and the memories shouldn&rsquo;t be figured
            out in the same week as the loss. So we built plans that save a little each month, earmarked
            specifically for photography and videography, and a vetted network of professionals who already know
            what the day requires — so no family has to find one from scratch while grieving.
          </p>
        </div>
        <div className="relative min-h-[240px] overflow-hidden rounded-[32px] md:min-h-[360px]">
          <Photo
            src={images.aboutOrigin}
            alt="The Journey Home team"
            className="absolute inset-0 size-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        </div>
      </Container>

      {/* VISION */}
      <section className="bg-foreground py-16 md:py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-canvas/10 text-accent">
            <Heart className="size-7" />
          </div>
          <h2 className="max-w-3xl font-serif text-[28px] font-normal italic leading-[1.3] text-canvas md:text-[40px] md:leading-[1.25]">
            We believe a family&rsquo;s last gift to someone they loved should be presence, not paperwork.
          </h2>
        </Container>
      </section>

      {/* CORE VALUES */}
      <Container className="flex flex-col gap-10 py-20">
        <div className="flex flex-col gap-3">
          <Eyebrow>What we stand for</Eyebrow>
          <h2 className="max-w-xl text-[32px] font-extrabold leading-[1.1] tracking-tight md:text-[44px]">Five things we don&rsquo;t compromise on.</h2>
        </div>
        <div className="flex flex-col gap-4">
          {VALUES.map(({ n, icon: Icon, title, body }) => (
            <div key={n} className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-7 md:flex-row md:items-center md:gap-8">
              <div className="flex items-center gap-4 md:w-[280px] md:flex-shrink-0">
                <span className="text-sm font-extrabold text-link">{n}</span>
                <div className="grid size-11 flex-shrink-0 place-items-center rounded-xl bg-status-active-bg text-status-active">
                  <Icon className="size-5" />
                </div>
                <div className="text-[17px] font-bold leading-snug">{title}</div>
              </div>
              <p className="text-base leading-relaxed text-muted md:max-w-md">{body}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* PHOTOGRAPHER NETWORK CTA */}
      <Container className="pb-20">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-sand px-8 py-7">
          <div className="flex items-center gap-4">
            <div className="grid size-11 flex-shrink-0 place-items-center rounded-xl bg-foreground text-accent">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-lg font-bold">Are you a photographer or videographer?</div>
              <div className="text-base text-muted">Join our verified network across 24 states and be the one a grieving family can count on.</div>
            </div>
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex h-12 flex-shrink-0 items-center rounded-full bg-foreground px-6 text-sm font-bold text-canvas">
            Get in touch
          </a>
        </div>
      </Container>

      {/* IMPACT */}
      <section className="bg-cream py-16 md:py-24">
        <Container className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div className="relative min-h-[240px] overflow-hidden rounded-[32px] md:order-2 md:min-h-[320px]">
            <Photo src={images.photographer} alt="One of our network photographers" className="absolute inset-0 size-full" />
          </div>
          <div className="flex flex-col gap-5 md:order-1">
            <Eyebrow>Making it easier, together</Eyebrow>
            <h2 className="max-w-md text-[36px] font-extrabold leading-[1.15] tracking-tight">A keepsake every relative can share in, wherever they are.</h2>
            <p className="max-w-md text-base leading-relaxed text-ink-soft">
              Every completed service comes with a shareable digital gallery, so family abroad can view and
              download the photos and keepsake film the same day — no one left out of the goodbye because of
              distance.
            </p>
          </div>
        </Container>
      </section>

      {/* MILESTONES */}
      <Container className="flex flex-col gap-10 py-20">
        <h2 className="max-w-lg text-[36px] font-extrabold leading-[1.15] tracking-tight">We&rsquo;re just getting started.</h2>
        <div className="grid gap-8 border-t border-border pt-10 md:grid-cols-2">
          {MILESTONES.map(([n, label]) => (
            <div key={label}>
              <div className="text-[32px] font-extrabold tracking-tight md:text-[44px]">{n}</div>
              <div className="text-sm text-muted">{label}</div>
            </div>
          ))}
        </div>
      </Container>

      <CtaBand
        title={<>Start your family&rsquo;s plan <Accent className="text-accent">today.</Accent></>}
        description="A few minutes to set up. Save at your own pace. We'll be ready when the time comes."
        href={SIGNUP_URL}
      />
    </main>
  );
}
