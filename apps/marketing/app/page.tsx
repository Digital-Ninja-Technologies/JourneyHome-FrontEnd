import Link from "next/link";
import { Calendar, Check, CheckCircle2, Clock, CreditCard, ImageIcon, MapPin } from "lucide-react";
import { Photo } from "../components/Photo";
import { PackageCards, PackagesUnavailable } from "../components/PackageCards";
import { Accent, Container, Eyebrow } from "../components/Section";
import { SIGNUP_URL } from "../lib/config";
import { images } from "../lib/images";
import { getPackages } from "../lib/packages";

export const revalidate = 300;

const FEATURES = [
  { icon: Calendar, title: "Multiple savings plans", body: "Track a separate plan for each loved one, all from one account.", tint: "bg-status-active-bg text-status-active" },
  { icon: MapPin, title: "Verified photographer network", body: "380+ photographers and videographers, vetted and matched across 24 states.", tint: "bg-cream text-link" },
  { icon: Clock, title: "Gentle reminders", body: "A nudge a few days before your contribution is due — never a surprise.", tint: "bg-[#E9EFEA] text-[#2F7D5B]" },
  { icon: ImageIcon, title: "Instant digital gallery", body: "Share photos and the keepsake film with family anywhere in the world.", tint: "bg-status-active-bg text-status-active" },
  { icon: CheckCircle2, title: "Full payment transparency", body: "Every contribution is dated, recorded, and receipted the moment it lands.", tint: "bg-cream text-link" },
  { icon: CreditCard, title: "Flexible payment methods", body: "Card, bank transfer, or recurring debit — whatever works for your family.", tint: "bg-[#E9EFEA] text-[#2F7D5B]" },
];

const STEPS = [
  ["01", "Start a plan", "Choose a loved one and a package."],
  ["02", "We verify", "Every naira is recorded and receipted."],
  ["03", "We prepare", "We assign a photographer near you."],
  ["04", "We capture the day", "Delivered as a keepsake you'll treasure."],
];

export default async function Home() {
  const packages = await getPackages();
  return (
    <main>
      {/* HERO */}
      <Container className="grid items-center gap-12 py-12 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col items-start gap-7">
          <h1 className="text-[44px] font-extrabold leading-none tracking-[-1px] sm:text-6xl sm:tracking-[-2px] md:text-[72px]">
            Save ahead.
            <br />
            Prepare with <Accent className="whitespace-nowrap text-[1.1em]">dignity.</Accent>
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-muted">
            Journey Home is where families save a little each month toward professional photography and videography for a
            loved one&rsquo;s burial — so when the time comes, you can be present, not scrambling.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={SIGNUP_URL} className="inline-flex h-14 items-center rounded-full bg-foreground px-7 text-[15px] font-bold text-canvas">
              Start saving today
            </a>
            <Link href="/how-it-works" className="inline-flex h-14 items-center rounded-full border border-border px-7 text-[15px] font-semibold">
              Watch how it works
            </Link>
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-[32px] shadow-2xl md:min-h-[600px]">
          <Photo src={images.hero} alt="A Nigerian family together, smiling" className="absolute inset-0 size-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-foreground/70" />
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-status-active">
            <span className="size-1.5 rounded-full bg-status-active" />
            Verified family, Lagos
          </span>
          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-2xl bg-white p-5">
            <div className="flex items-center gap-3.5">
              <div className="grid size-[46px] place-items-center rounded-xl bg-foreground text-accent">
                <Check className="size-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Total saved</div>
                <div className="text-2xl font-extrabold tracking-tight">₦240,000</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">Saving since</div>
              <div className="text-sm font-bold text-status-active">Mar 2025 · ongoing</div>
            </div>
          </div>
        </div>
      </Container>

      {/* BENTO */}
      <Container className="flex flex-col gap-8 py-16">
        <div className="flex flex-col gap-3">
          <Eyebrow>Why families choose us</Eyebrow>
          <h2 className="max-w-2xl text-[32px] font-extrabold leading-[1.1] tracking-tight md:text-[44px]">Built for peace of mind, not paperwork.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr] md:grid-rows-2">
          <div className="flex flex-col justify-between gap-10 rounded-[32px] bg-foreground p-10 md:row-span-2">
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-bold text-canvas">Every naira tracked, always visible</div>
              <div className="max-w-xs text-sm leading-relaxed text-canvas/70">
                No black box. Every contribution is dated, recorded, and receipted the moment it lands.
              </div>
            </div>
            <div className="rounded-2xl border border-canvas/10 bg-canvas/5 p-5 text-xs text-canvas">
              {[
                ["Journey Home Plan · Emeka", "₦10,000", "15 Sep · Card ••4821"],
                ["Journey Home Plan · Ngozi", "₦10,000", "12 Sep · Card ••4821"],
              ].map(([who, amt, meta], i) => (
                <div key={who} className={i ? "mt-3 border-t border-canvas/10 pt-3" : ""}>
                  <div className="flex justify-between"><span>{who}</span><span className="font-semibold">{amt}</span></div>
                  <div className="mt-1 flex justify-between text-canvas/60"><span>{meta}</span><span className="text-[#6BC596]">Successful</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[220px] overflow-hidden rounded-[32px]">
            <Photo src={images.photographer} alt="One of our network photographers" className="absolute inset-0 size-full" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/80" />
            <div className="absolute inset-x-7 bottom-6 text-canvas">
              <div className="text-xl font-bold">380+ photographers, nationwide</div>
              <div className="text-sm text-canvas/80">We assign someone near your family, wherever the service is needed.</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-[32px] bg-status-active-bg p-8">
            <Calendar className="size-8 text-status-active" />
            <div className="text-xl font-bold">Multiple plans, one account</div>
            <div className="text-sm leading-relaxed text-ink-soft">
              Parents, grandparents, uncles, aunts — a plan for each, all in your dashboard.
            </div>
          </div>
        </div>
      </Container>

      {/* FEATURES */}
      <Container className="flex flex-col gap-10 py-16">
        <div className="flex flex-col gap-3">
          <Eyebrow className="text-status-active">Features</Eyebrow>
          <h2 className="max-w-xl text-[32px] font-extrabold leading-[1.1] tracking-tight md:text-[44px]">Everything you need, in one place.</h2>
          <p className="max-w-lg text-base leading-relaxed text-muted">
            From the first contribution to the final keepsake, Journey Home handles the logistics so your family doesn&rsquo;t have to.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, tint }) => (
            <div key={title} className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-7">
              <div className={`grid size-11 place-items-center rounded-xl ${tint}`}>
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-[17px] font-bold">{title}</div>
                <div className="mt-1.5 text-sm leading-relaxed text-muted">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* HOW IT WORKS TEASER */}
      <section className="bg-foreground py-14 md:py-20">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <Eyebrow className="text-accent">How it works</Eyebrow>
              <h2 className="text-[32px] font-extrabold tracking-tight text-canvas md:text-[44px]">Four steps, taken gently.</h2>
            </div>
            <Link href="/how-it-works" className="text-sm font-bold text-accent">
              See the full walkthrough →
            </Link>
          </div>
          <div className="grid gap-10 md:grid-cols-[1.25fr_1fr]">
            <div className="flex flex-col gap-4">
              {STEPS.map(([n, title, body]) => (
                <div key={n} className="flex items-center gap-6 rounded-3xl border border-canvas/10 bg-forest px-7 py-6">
                  <div className="text-sm font-extrabold text-accent">{n}</div>
                  <div>
                    <div className="text-lg font-bold text-canvas">{title}</div>
                    <div className="text-sm text-canvas/70">{body}</div>
                  </div>
                </div>
              ))}
            </div>
            <Photo src={images.howItWorks} alt="A photographer capturing a multi-generational family portrait at home" className="h-full max-h-[460px] min-h-[280px] w-full rounded-[32px]" />
          </div>
        </Container>
      </section>

      {/* PRICING TEASER */}
      <Container className="flex flex-col gap-10 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="max-w-xl text-[32px] font-extrabold leading-[1.1] tracking-tight md:text-[44px]">Save at whatever pace suits your family.</h2>
          </div>
          <Link href="/pricing" className="text-sm font-bold">
            Compare all packages →
          </Link>
        </div>
        {packages?.length ? <PackageCards packages={packages} /> : <PackagesUnavailable />}
      </Container>

      {/* TESTIMONIAL */}
      <section className="bg-cream py-16 md:py-24">
        <Container className="flex flex-col items-center gap-8 text-center">
          <blockquote className="max-w-3xl font-serif text-[26px] leading-[1.3] text-[#2A1B07] md:text-[38px] md:leading-[1.2]">
            &ldquo;We had been saving for two years without really knowing what for. When the day came, Journey Home just{" "}
            <Accent>showed up</Accent> — the film they gave us is the thing my children watch every year.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3.5 text-left">
            <Photo src={images.testimonial} alt="" className="size-12 rounded-full border-2 border-accent/50" />
            <div>
              <div className="text-sm font-bold">Adaeze N.</div>
              <div className="text-xs text-link">Journey Home Plan, Lagos</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CLOSING CTA */}
      <Container className="py-14 md:py-24">
        <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[40px] bg-foreground px-6 py-14 text-center sm:px-8 md:py-20">
          <div className="absolute -bottom-40 left-1/2 size-[380px] -translate-x-1/2 rounded-full bg-forest/60" aria-hidden />
          <h2 className="relative text-4xl font-extrabold tracking-tight text-canvas md:text-5xl">
            Start your family&rsquo;s plan <Accent className="text-accent">today.</Accent>
          </h2>
          <p className="relative max-w-md text-base leading-relaxed text-canvas/80">
            A few minutes to set up. Save at your own pace. We&rsquo;ll be ready when the time comes.
          </p>
          <a href={SIGNUP_URL} className="relative inline-flex h-14 items-center rounded-full bg-accent px-8 text-[15px] font-extrabold text-foreground">
            Start a plan
          </a>
        </div>
      </Container>
    </main>
  );
}
