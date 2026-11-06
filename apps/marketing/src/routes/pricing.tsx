import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AsyncBoundary } from "@/components/async-boundary";
import { createPageHead } from "@/lib/seo";
import { Accent, Container, PageHero } from "@/modules/marketing";
import {
  billingUnit,
  featureMatrix,
  formatMoney,
  type Package,
  PackageCards,
  PackageCardsSkeleton,
  PackagesUnavailable,
  packagesQueryOptions,
} from "@/modules/packages";

export const Route = createFileRoute("/pricing")({
  headers: () => ({
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=31535700",
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(packagesQueryOptions());
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

function PricingPackages() {
  const { data: packages } = useSuspenseQuery(packagesQueryOptions());

  if (!packages?.length) {
    return <PackagesUnavailable />;
  }

  return (
    <div className="flex flex-col gap-12">
      <PackageCards packages={packages} showFeatures />
      <ComparisonTable packages={packages} />
    </div>
  );
}

/** Side-by-side view of each package's own features, straight from the API. */
function ComparisonTable({ packages }: { packages: Package[] }) {
  const rows = featureMatrix(packages);
  if (packages.length < 2 || rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-3xl bg-background p-2">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="px-6 py-4.5 font-semibold text-muted-foreground">
              Feature
            </th>
            {packages.map((p) => (
              <th
                key={p._id}
                className="px-6 py-4.5 text-center font-extrabold"
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <PricingRow
            index={0}
            label="Contribution"
            cells={packages.map((p) => ({
              id: p._id,
              value: `${formatMoney(p.amount, p.currency)} / ${billingUnit(p.billingInterval)}`,
            }))}
          />
          {rows.map((row, i) => (
            <PricingRow
              key={row.label}
              index={i + 1}
              label={row.label}
              cells={packages.map((p) => ({
                id: p._id,
                value: row.includedIn.has(p._id),
              }))}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingRow({
  index,
  label,
  cells,
}: {
  index: number;
  label: string;
  cells: { id: string; value: string | boolean }[];
}) {
  return (
    <tr
      className={
        index % 2 === 0
          ? "bg-white [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl"
          : ""
      }
    >
      <td className="px-6 py-4">{label}</td>
      {cells.map(({ id, value: cell }) => (
        <td key={id} className="px-6 py-4 text-center">
          {cell === true ? (
            <>
              <Check aria-hidden className="inline size-4 text-status-active" />
              <span className="sr-only">Included</span>
            </>
          ) : cell === false ? (
            <>
              <span aria-hidden className="text-muted-foreground">
                —
              </span>
              <span className="sr-only">Not included</span>
            </>
          ) : (
            cell
          )}
        </td>
      ))}
    </tr>
  );
}

function Pricing() {
  return (
    <main>
      <PageHero
        eyebrow="Pricing"
        intro="Every package includes full verification and a dedicated photographer. Choose how much coverage you want on the day."
      >
        Save at whatever pace suits your <Accent>family.</Accent>
      </PageHero>
      <Container className="pb-24">
        <AsyncBoundary
          loadingFallback={<PackageCardsSkeleton showFeatures />}
          errorFallback={({ resetErrorBoundary }) => (
            <PackagesUnavailable onRetry={resetErrorBoundary} />
          )}
        >
          <PricingPackages />
        </AsyncBoundary>
      </Container>
    </main>
  );
}
