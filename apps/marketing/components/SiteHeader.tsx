"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 bg-canvas px-6 py-5 md:px-20">
      <Link href="/">
        <Logo />
      </Link>
      <nav aria-label="Main" className="order-last flex w-full items-center gap-1 overflow-x-auto rounded-full bg-sand p-1.5 md:order-none md:w-auto">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
        <a href={LOGIN_URL} className="text-sm font-bold">
          Log in
        </a>
        <a href={SIGNUP_URL} className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-extrabold text-foreground">
          Get started →
        </a>
      </div>
    </header>
  );
}
