import { cn } from "@journeyhome/ui/lib/utils";

export function Photo({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("object-cover", className)} />;
  }
  return <div role="img" aria-label={alt} className={cn("bg-gradient-to-br from-forest to-foreground/70", className)} />;
}
