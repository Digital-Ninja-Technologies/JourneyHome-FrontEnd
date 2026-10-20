import type { Metadata } from "next";
import { PackageCards, PackagesUnavailable } from "../../components/PackageCards";
import { Accent, Container, PageHero } from "../../components/Section";
import { getPackages } from "../../lib/packages";

export const metadata: Metadata = { title: "Pricing" };
export const revalidate = 300;

// Mirrors the comparison table in the Design canvas mockup (Pricing.dc.html) for now,
// rather than deriving rows from live package data.
const COLUMNS = ["Basic", "Standard", "Premium"];
const ROWS: [string, string, string, string][] = [
  ["Photography", "Half-day", "Full-day", "Full-day"],
  ["Videography", "—", "✓", "✓ + second camera"],
  ["Printed album", "—", "40 pages", "Premium, leather"],
  ["Digital gallery", "✓", "✓", "✓"],
  ["Drone coverage", "—", "—", "Where permitted"],
];

export default async function Pricing() {
  const packages = await getPackages();
  return (
    <main>
      <PageHero
        eyebrow="Pricing"
        intro="Every package includes full verification and a dedicated photographer. Choose how much coverage you want on the day."
      >
        Save at whatever pace suits your <Accent>family.</Accent>
      </PageHero>
      <Container className="pb-12">{packages?.length ? <PackageCards packages={packages} showFeatures /> : <PackagesUnavailable />}</Container>
      <Container className="pb-24">
        <div className="overflow-x-auto rounded-3xl bg-background p-2">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="px-6 py-4.5 font-semibold text-muted">Feature</th>
                {COLUMNS.map((c) => (
                  <th key={c} className="px-6 py-4.5 text-center font-extrabold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, basic, standard, premium], i) => (
                <tr key={label} className={i % 2 === 0 ? "bg-white [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl" : ""}>
                  <td className="px-6 py-4">{label}</td>
                  <td className="px-6 py-4 text-center">{basic}</td>
                  <td className="px-6 py-4 text-center">{standard}</td>
                  <td className="px-6 py-4 text-center">{premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}
