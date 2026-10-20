import type { Metadata } from "next";
import { Photo } from "../../components/Photo";
import { Accent, Container, CtaBand, PageHero } from "../../components/Section";
import { SIGNUP_URL } from "../../lib/config";
import { images } from "../../lib/images";

export const metadata: Metadata = { title: "How it works" };

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-extrabold text-link">{n}</div>
      <h3 className="text-3xl font-extrabold tracking-tight">{title}</h3>
      <p className="max-w-md text-base leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-7 text-sm shadow-sm">{children}</div>;
}

const Row = ({ a, b, bClass = "font-semibold" }: { a: string; b: string; bClass?: string }) => (
  <div className="flex justify-between gap-4"><span>{a}</span><span className={bClass}>{b}</span></div>
);

export default function HowItWorks() {
  return (
    <main>
      <PageHero eyebrow="How it works" intro="From the first naira saved to the day the film arrives — here's exactly what happens, and when.">
        Four steps, taken <Accent>gently.</Accent>
      </PageHero>
      <Container className="pb-14">
        <Photo src={images.howStep1} alt="A family together, planning ahead with care" className="h-[400px] w-full rounded-[32px] md:h-[560px]" />
      </Container>
      <Container className="flex flex-col gap-20 pb-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Step n="01" title="Start a plan">
            Pick a loved one, choose a package, and set how much you&rsquo;d like to contribute each month. Most families start between ₦5,000 and ₦15,000.
          </Step>
          <Panel>
            <div className="text-xs font-extrabold uppercase tracking-wider text-link">New plan</div>
            <Row a="For: Emeka (father)" b="Standard" />
            <Row a="Monthly contribution" b="₦10,000" />
          </Panel>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <Panel>
            <Row a="Emeka — Sep contribution" b="₦10,000" />
            <Row a="15 Sep · Card ••4821" b="Verified" bClass="font-bold text-status-active" />
            <hr className="border-border" />
            <Row a="Ngozi — Sep contribution" b="₦8,000" />
            <Row a="12 Sep · Bank transfer" b="Verified" bClass="font-bold text-status-active" />
          </Panel>
          <Step n="02" title="We verify">
            Every contribution is dated, recorded, and receipted the moment it lands, visible to you in your dashboard at any time, in full.
          </Step>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <Step n="03" title="We prepare">
            As the date approaches, we assign a photographer or videographer from our network of 380+, matched to your state and the service&rsquo;s size.
          </Step>
          <Panel>
            <Row a="Service progress" b="Step 4 of 5" />
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < 4 ? "bg-status-active" : "bg-sand"}`} />
              ))}
            </div>
            <div className="text-xs text-muted">
              Received → Verified → Approved → <strong className="text-foreground">Assigned</strong> → Completed
            </div>
          </Panel>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <Photo src={images.howStep4} alt="" className="min-h-[340px] w-full rounded-[32px]" />
          <Step n="04" title="We capture the day">
            Full-day photography and videography, delivered as an edited keepsake film and a printed album, so your family can be present, not managing logistics.
          </Step>
        </div>
      </Container>
      <CtaBand title="Ready to begin?" href={SIGNUP_URL} />
    </main>
  );
}
