import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:-translate-y-[0.5px] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-md",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs hover:shadow-md",
        outline:
          "border border-border bg-background hover:bg-muted/20 hover:text-foreground shadow-xs hover:shadow-xs aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-muted/20 hover:text-foreground hover:-translate-y-[0.5px] active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        link: "text-link underline-offset-4 hover:text-link-hover hover:underline hover:translate-y-0 active:scale-100 shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm gap-2",
        xs: "h-6 px-2.5 text-xs gap-1 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 text-xs gap-1.5",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "size-10 gap-0",
        "icon-xs": "size-6 gap-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 gap-0",
        "icon-lg": "size-12 gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
