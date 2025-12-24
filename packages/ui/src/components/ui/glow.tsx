import React from "react";
import { cn } from "@repo/ui/lib/utils"; // Adjust if not using this helper
import { cva, VariantProps } from "class-variance-authority";

const glowVariants = cva("absolute w-full", {
    variants: {
        variant: {
            top: "top-0",
            above: "-top-[128px]",
            bottom: "bottom-0",
            below: "-bottom-[128px]",
            center: "top-[50%]",
        },
    },
    defaultVariants: {
        variant: "top",
    },
});

const Glow = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(glowVariants({ variant }), className)}
        {...props}
    >
        {/* Light mode glow (stronger orange) */}
        <div
            className={cn(
                "absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(24,100%,60%,0.8)_10%,_hsla(24,100%,60%,0)_70%)] sm:h-[512px] dark:hidden",
                variant === "center" && "-translate-y-1/2"
            )}
        />
        <div
            className={cn(
                "absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(24,100%,75%,0.5)_10%,_hsla(24,100%,75%,0)_70%)] sm:h-[256px] dark:hidden",
                variant === "center" && "-translate-y-1/2"
            )}
        />

        {/* Dark mode glow (vibrant teal/aqua) */}
        <div
            className={cn(
                "absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] hidden dark:block bg-[radial-gradient(ellipse_at_center,_hsla(180,100%,70%,0.5)_10%,_hsla(180,100%,70%,0)_70%)] sm:h-[512px]",
                variant === "center" && "-translate-y-1/2"
            )}
        />
        <div
            className={cn(
                "absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] hidden dark:block bg-[radial-gradient(ellipse_at_center,_hsla(180,100%,85%,0.3)_10%,_hsla(180,100%,85%,0)_70%)] sm:h-[256px]",
                variant === "center" && "-translate-y-1/2"
            )}
        />
    </div>
));
Glow.displayName = "Glow";

export { Glow };