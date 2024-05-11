import * as React from "react"

import { cn } from "@/lib/utils"

type TypographyProps = {
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  ariaLabel?: string
} & React.HTMLAttributes<HTMLElement>

const Typography = React.forwardRef<HTMLHeadingElement, TypographyProps>(function Typography(
  { variant, className, ariaLabel, ...props },
  ref
) {
  const Component = variant
  return (
    <Component
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        {
          "scroll-m-20 text-base tracking-wide lg:text-3xl": variant === "h1",
          "scroll-m-20 text-base tracking-wide lg:text-2xl": variant === "h2",
          "scroll-m-20 text-sm tracking-wide lg:text-base":
            variant === "h3" || variant === "h4" || variant === "h5" || variant === "h6",
          "scroll-m-20 text-sm font-light lg:text-base": variant === "span",
          "text-sm font-light leading-7 md:text-base lg:text-base [&:not(:first-child)]:mt-6": variant === "p",
        },
        className
      )}
      {...props}
    />
  )
})

export default Typography
