import type { Metadata } from "next";
import { PackageCards, PackagesUnavailable } from "../../components/PackageCards";
import { Accent, Container, PageHero } from "../../components/Section";
import { getPackages, type Package } from "../../lib/packages";

export const metadata: Metadata = { title: "Pricing" };
export const revalidate = 300;

const ROWS: [string, (p: Package) => string][] = [
  ["Photography", (p) => (p.photographyIncluded ? "✓" : "—")],
  ["Videography", (p) => (p.videographyIncluded ? "✓" : "—")],
  ["Coverage", (p) => p.coverageDetails || "—"],
  ["Deliverables", (p) => p.deliverables.join(", ") || "—"],
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
      {packages && packages.length > 0 && (
        <Container className="pb-24">
          <div className="overflow-x-auto rounded-3xl border border-border bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-extrabold uppercase tracking-wider text-link">
                  <th className="px-6 py-4">Feature</th>
                  {packages.map((p) => (
                    <th key={p._id} className="px-6 py-4">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, cell], i) => (
                  <tr key={label} className={i % 2 ? "" : "bg-canvas/60"}>
                    <td className="px-6 py-4 font-bold">{label}</td>
                    {packages.map((p) => (
                      <td key={p._id} className="px-6 py-4 text-muted">{cell(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      )}
    </main>
  );
}
