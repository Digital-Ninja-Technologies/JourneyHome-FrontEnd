import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Logo } from "@journeyhome/ui/components/logo";
import { cn } from "@journeyhome/ui/lib/utils";
import { LOGIN_URL, SIGNUP_URL } from "../lib/config";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever navigation happens.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-canvas/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-5 md:px-20">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full bg-sand p-1.5 md:flex">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm",
                  active ? "bg-foreground font-bold text-canvas" : "font-semibold text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3.5">
          <a href={LOGIN_URL} className="hidden text-sm font-bold md:inline">
            Log in
          </a>
          <a
            href={SIGNUP_URL}
            className="hidden h-12 items-center rounded-full bg-accent px-6 text-sm font-extrabold text-foreground md:inline-flex"
          >
            Get started →
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="flex max-h-[calc(100vh-80px)] flex-col gap-1 overflow-y-auto border-t border-border/60 bg-canvas p-4 md:hidden"
        >
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-2xl px-4 py-3.5 text-[15px] font-semibold",
                  active ? "bg-sand text-foreground" : "text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a href={LOGIN_URL} className="rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-ink-soft">
            Log in
          </a>
          <a
            href={SIGNUP_URL}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-extrabold text-foreground"
          >
            Get started →
          </a>
        </nav>
      )}
    </header>
  );
}
