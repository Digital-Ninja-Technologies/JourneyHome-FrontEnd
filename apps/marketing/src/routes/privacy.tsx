import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/config";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    createPageHead({
      title: "Privacy policy",
      description:
        "Read Journey Home's privacy policy and learn how we protect your personal and financial information.",
      path: "/privacy",
    }),
  component: Privacy,
});

const link = "font-bold text-link underline";

function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      accent="policy."
      updated="1 October 2026"
      sections={[
        {
          heading: "1. Information we collect",
          body: "To set up and run a Plan, we collect your name, contact details, payment information, and details about the loved one each Plan is for. When you request a service, we also collect the information needed to coordinate it, such as location and scheduling details.",
        },
        {
          heading: "2. How we use your information",
          body: "We use your information to process contributions, keep your dashboard accurate, send payment reminders, assign a photographer or videographer when a service is requested, and respond to your enquiries.",
        },
        {
          heading: "3. Sharing with photographers & videographers",
          body: "When you request a service, we share only the information a matched photographer or videographer needs to carry it out — such as location and the service's date and scale. We do not sell your information to third parties.",
        },
        {
          heading: "4. Payment data",
          body: "Card and bank details are handled by our payment processing partners; Journey Home does not store full card numbers. Every contribution is dated, recorded, and receipted, and is visible to you in your dashboard at any time.",
        },
        {
          heading: "5. Data security",
          body: "We use industry-standard safeguards to protect your information against unauthorized access, alteration, or loss. No system is completely secure, and we work continuously to improve ours.",
        },
        {
          heading: "6. Your rights",
          body: "You may request a copy of the information we hold about you, ask us to correct it, or ask us to delete it, subject to our record-keeping obligations for active Plans and completed services.",
        },
        {
          heading: "7. Changes to this policy",
          body: "We may update this policy from time to time. Material changes will be communicated to Plan holders in advance of taking effect.",
        },
        {
          heading: "8. Contact",
          body: (
            <>
              Questions about this policy, or requests about your data, can be
              sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
                {CONTACT_EMAIL}
              </a>{" "}
              or via our{" "}
              <Link to="/contact" className={link}>
                Contact page
              </Link>
              .
            </>
          ),
        },
      ]}
    />
  );
}
