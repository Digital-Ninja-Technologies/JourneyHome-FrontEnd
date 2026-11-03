import { Accent, Container, PageHero } from "./section";

export function LegalPage({
  title,
  accent,
  updated,
  sections,
}: {
  title: string;
  accent: string;
  updated: string;
  sections: { heading: string; body: React.ReactNode }[];
}) {
  return (
    <main>
      <PageHero eyebrow="Legal" intro={`Last updated: ${updated}`}>
        {title} <Accent>{accent}</Accent>
      </PageHero>
      <Container className="max-w-3xl pb-24">
        <div className="flex flex-col gap-9">
          {sections.map((s) => (
            <section key={s.heading} className="flex flex-col gap-2.5">
              <h2 className="text-xl font-extrabold tracking-tight">
                {s.heading}
              </h2>
              <p className="text-[15px] leading-[1.75] text-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
