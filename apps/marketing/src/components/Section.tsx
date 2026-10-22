import { cn } from "@journeyhome/ui/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-20", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-xs font-extrabold uppercase tracking-[2px] text-link", className)} {...props} />;
}

export function Accent({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("font-serif font-normal italic text-link", className)} {...props} />;
}

export function PageHero({
  eyebrow,
  children,
  intro,
  center = true,
}: {
  eyebrow: string;
  children: React.ReactNode;
  intro?: string;
  /** Mockups center every page hero except About's (which pairs with left-aligned intro prose). */
  center?: boolean;
}) {
  return (
    <Container className={cn("flex flex-col gap-4 pb-12 pt-14", center && "items-center text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className={cn("max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-[56px]", center && "mx-auto")}>{children}</h1>
      {intro && <p className={cn("max-w-xl text-lg leading-relaxed text-muted", center && "mx-auto")}>{intro}</p>}
    </Container>
  );
}

export function CtaBand({
  title,
  description,
  label = "Start a plan",
  href,
}: {
  title: React.ReactNode;
  description?: string;
  label?: string;
  href: string;
}) {
  return (
    <Container className="py-12">
      <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-[32px] bg-foreground px-8 py-16 text-center md:py-20">
        <div className="absolute -bottom-40 left-1/2 size-[380px] -translate-x-1/2 rounded-full bg-accent/[0.07]" aria-hidden />
        <h2 className="relative max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight text-canvas md:text-5xl">{title}</h2>
        {description && <p className="relative max-w-md text-base leading-relaxed text-canvas/80">{description}</p>}
        <a href={href} className="relative inline-flex h-14 items-center rounded-full bg-accent px-8 text-[15px] font-extrabold text-foreground">
          {label}
        </a>
      </div>
    </Container>
  );
}
