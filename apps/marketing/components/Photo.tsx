import { cn } from "@journeyhome/ui/lib/utils";

export function Photo({
  src,
  alt,
  className,
  style,
}: {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("object-cover", className)} style={style} />;
  }
  return <div role="img" aria-label={alt} className={cn("bg-gradient-to-br from-forest to-foreground/70", className)} style={style} />;
}
