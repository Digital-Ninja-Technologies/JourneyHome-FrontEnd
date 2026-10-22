import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PackageCards, PackagesUnavailable } from "../components/PackageCards";
import { Accent, Container, PageHero } from "../components/Section";
import { createPageHead } from "../lib/seo";
import { packagesQueryOptions } from "../modules/packages";

export const Route = createFileRoute("/pricing")({
  headers: () => ({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=31535700",
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(packagesQueryOptions());
  },
  head: () =>
    createPageHead({
      title: "Pricing",
      description:
        "Compare Journey Home pricing and coverage packages. Choose the plan that suits your family.",
      path: "/pricing",
    }),
  component: Pricing,
});

const COLUMNS = ["Basic", "Standard", "Premium"];
const ROWS: [string, string, string, string][] = [
  ["Photography", "Half-day", "Full-day", "Full-day"],
  ["Videography", "—", "✓", "✓ + second camera"],
  ["Printed album", "—", "40 pages", "Premium, leather"],
  ["Digital gallery", "✓", "✓", "✓"],
  ["Drone coverage", "—", "—", "Where permitted"],
];

function Pricing() {
  const { data: packages } = useSuspenseQuery(packagesQueryOptions());

  return (
    <main>
      <PageHero
        eyebrow="Pricing"
        intro="Every package includes full verification and a dedicated photographer. Choose how much coverage you want on the day."
      >
        Save at whatever pace suits your <Accent>family.</Accent>
      </PageHero>
      <Container className="pb-12">
        {packages?.length ? (
          <PackageCards packages={packages} showFeatures />
        ) : (
          <PackagesUnavailable />
        )}
      </Container>
      <Container className="pb-24">
        <div className="overflow-x-auto rounded-3xl bg-background p-2">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="px-6 py-4.5 font-semibold text-muted">Feature</th>
                {COLUMNS.map((c) => (
                  <th key={c} className="px-6 py-4.5 text-center font-extrabold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, basic, standard, premium], i) => (
                <tr
                  key={label}
                  className={
                    i % 2 === 0
                      ? "bg-white [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl"
                      : ""
                  }
                >
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
