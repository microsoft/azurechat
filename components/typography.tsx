import { cn } from "@/lib/utils";
import * as React from "react";

type TypographyProps = {
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "p";
} & React.HTMLAttributes<HTMLElement>;

const Typography = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  function Typography({ variant, className, ...props }, ref) {
    const Component = variant;
    return (
      <Component
        ref={ref}
        className={cn(
          {
            "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl":
              variant === "h1",
            "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0":
              variant === "h2",
            "scroll-m-20 text-2xl font-semibold tracking-tight":
              variant === "h3",
            "scroll-m-20 text-xl font-semibold tracking-tight":
              variant === "h4",
            "scroll-m-20 text-x font-semibold tracking-tight": variant === "h5",
            "leading-7 [&:not(:first-child)]:mt-6": variant === "p",
          },
          className
        )}
        {...props}
      />
    );
  }
);

export default Typography;
