import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";
import { CONTACT_EMAIL } from "../lib/config";
import { createPageHead } from "../lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    createPageHead({
      title: "Plan terms & conditions",
      description:
        "Review the plan terms and conditions for Journey Home savings plans and memorial services.",
      path: "/terms",
    }),
  component: Terms,
});

const link = "font-bold text-link underline";

function Terms() {
  return (
    <LegalPage
      title="Plan terms &"
      accent="conditions."
      updated="1 October 2026"
      sections={[
        { heading: "1. The service", body: "Journey Home lets you set up one or more savings plans (\"Plans\"), each tied to a named loved one, toward future photography and videography coverage of that person's burial service. A Plan has no fixed term or end date — contributions continue for as long as you choose, until the service is requested." },
        { heading: "2. Contributions", body: "You choose a monthly contribution amount and a package (Basic, Standard, or Premium) when you start a Plan. Every contribution is dated, recorded, and receipted the moment it is received, and is visible in your dashboard at any time." },
        { heading: "3. Missed payments & deficits", body: "If a scheduled contribution is missed, nothing on your Plan is forfeited. Instead, the missed amount is recorded as a deficit. You clear a deficit at your next convenient payment, alongside your regular contribution, whenever that works for you — there is no penalty for the time it takes to clear it." },
        { heading: "4. Changing or adding plans", body: "The package you choose (Basic, Standard, or Premium) is fixed for the life of a Plan and cannot be changed once that Plan has started. If your needs change, you may close the Plan and start a new one at the package you want — your saved balance on a closed Plan is handled as set out in Section 6. You may hold more than one Plan at a time, each tracked separately within your account." },
        { heading: "5. Requesting the service", body: "When the service is needed, you submit a service request through your dashboard. We assign a photographer or videographer from our verified network, matched to your state and the scale of the service. Delivery includes a digital gallery and, depending on package, a printed album." },
        { heading: "6. Cancellation & refunds", body: "You may close a Plan at any time. Balances saved toward a Plan that is closed before a service is requested are refundable, subject to verification, minus any outstanding deficit on that Plan." },
        { heading: "7. Changes to these terms", body: "We may update these terms from time to time. Material changes will be communicated to Plan holders in advance of taking effect." },
        { heading: "8. Contact", body: <>Questions about these terms can be sent to <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a> or via our <Link to="/contact" className={link}>Contact page</Link>.</> },
      ]}
    />
  );
}
