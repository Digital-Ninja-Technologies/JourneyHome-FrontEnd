import { Link } from "@tanstack/react-router";
import { Logo } from "@journeyhome/ui/components/logo";
import { openCookiePreferences } from "@/components/cookie-consent";

const COLUMNS = [
  { title: "Product", links: [["/how-it-works", "How it works"], ["/pricing", "Pricing"], ["/faq", "FAQ"]] },
  { title: "Company", links: [["/about", "About us"], ["/contact", "Contact"]] },
  { title: "Legal", links: [["/terms", "Plan terms & conditions"], ["/privacy", "Privacy policy"]] },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 pb-14 pt-16 md:px-20">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3.5">
          <Logo />
          <p className="max-w-[260px] text-sm leading-relaxed text-muted">
            Save ahead. Prepare with dignity. Capture the memories that matter.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3 text-sm font-semibold">
            <div className="mb-1 text-xs font-extrabold uppercase tracking-[1.5px] text-link">{col.title}</div>
            {col.links.map(([href, label]) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
            {col.title === "Legal" && (
              <button
                type="button"
                onClick={() => openCookiePreferences()}
                className="text-left font-semibold transition-colors hover:text-link cursor-pointer"
              >
                Cookie preferences
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-6 text-[13px] text-muted">
        <span>© {new Date().getFullYear()} Journey Home. All rights reserved.</span>
        <span>Lagos, Nigeria</span>
      </div>
    </footer>
  );
}
