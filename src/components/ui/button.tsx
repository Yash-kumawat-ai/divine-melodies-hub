import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-250 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-royal-primary",
        destructive: "bg-red-700 text-white hover:bg-red-800 shadow-[0_6px_14px_rgba(185,28,28,0.15)] hover:translate-y-[-1px] active:translate-y-0",
        outline: "btn-royal-secondary",
        secondary: "btn-royal-secondary",
        ghost: "btn-royal-ghost",
        link: "text-[#6A1418] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[54px] px-6 rounded-[16px] text-base [&_svg]:size-[22px]",
        sm: "h-9 px-4 rounded-[12px] text-xs [&_svg]:size-[16px]",
        lg: "h-[58px] px-8 rounded-[16px] text-lg [&_svg]:size-[24px]",
        icon: "btn-royal-icon w-11 h-11",
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
