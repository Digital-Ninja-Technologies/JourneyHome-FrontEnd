import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@journeyhome/ui/components/card";
import { cn } from "@journeyhome/ui/lib/utils";

/** Titled panel used across detail and settings screens. */
export function SectionCard({
  title,
  description,
  action,
  tone = "default",
  className,
  contentClassName,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** `dark` is the ink panel used for status/decision cards. */
  tone?: "default" | "dark";
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <Card
      className={cn(
        "rounded-3xl shadow-none ring-0",
        dark ? "bg-foreground text-canvas" : "bg-white",
        className,
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "font-serif text-[24px] font-normal leading-tight",
            dark && "text-canvas",
          )}
        >
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={cn(dark && "text-canvas/70")}>
            {description}
          </CardDescription>
        )}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {children && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}
    </Card>
  );
}
