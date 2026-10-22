import { cn } from "@journeyhome/ui/lib/utils";

export function Photo({
  src,
  alt,
  className,
  style,
  loading = "lazy",
}: {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn("object-cover", className)}
        style={style}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("bg-gradient-to-br from-forest to-foreground/70", className)}
      style={style}
    />
  );
}
