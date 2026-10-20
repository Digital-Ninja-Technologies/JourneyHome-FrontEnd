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

export function PageHero({ eyebrow, children, intro }: { eyebrow: string; children: React.ReactNode; intro?: string }) {
  return (
    <Container className="flex flex-col gap-4 pb-12 pt-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-[56px]">{children}</h1>
      {intro && <p className="max-w-xl text-lg leading-relaxed text-muted">{intro}</p>}
    </Container>
  );
}

export function CtaBand({ title, label = "Start a plan", href }: { title: string; label?: string; href: string }) {
  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-foreground px-10 py-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-canvas">{title}</h2>
        <a href={href} className="inline-flex h-14 items-center rounded-full bg-accent px-8 text-[15px] font-extrabold text-foreground">
          {label}
        </a>
      </div>
    </Container>
  );
}
