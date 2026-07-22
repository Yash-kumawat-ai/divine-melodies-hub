import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DESIGN SYSTEM: 4 button variants. No exceptions.
 *
 *  default     → btn-primary   (brand crimson, white text — main CTA)
 *  secondary   → btn-secondary (white bg, brand text, gold border — secondary action)
 *  ghost       → btn-ghost     (transparent, brand text — nav, cancel, links)
 *  destructive → btn-danger    (red semantic — delete, leave, remove ONLY)
 *
 * Sizes: default (44px h), sm (36px h), lg (52px h), icon (44×44 circle)
 */
const buttonVariants = cva(
  "btn-base inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "btn-primary",
        secondary:   "btn-secondary",
        outline:     "btn-secondary",   /* alias — outline maps to secondary */
        ghost:       "btn-ghost",
        destructive: "btn-danger",
        link: "text-brand-primary underline-offset-4 hover:underline bg-transparent border-none shadow-none h-auto p-0",
      },
      size: {
        default: "h-11 px-5 text-sm rounded-lg",       /* 44px */
        sm:      "h-9 px-4 text-[13px] rounded-md",    /* 36px */
        lg:      "h-[52px] px-7 text-base rounded-lg", /* 52px */
        icon:    "btn-icon w-11 h-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
