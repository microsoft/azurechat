import { cn } from "@/lib/utils"
import * as React from "react"

type TypographyProps = {
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span"
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
          "scroll-m-20 text-xl tracking-tight lg:text-2xl ": variant === "h1",
          "scroll-m-20 pb-2 text-lg tracking-tight transition-colors first:mt-0 lg:text-xl": variant === "h2",
          "scroll-m-20 text-sm tracking-tight lg:text-lg": variant === "h3",
          "scroll-m-20 text-sm tracking-tight md:text-base": variant === "h4" || variant === "h5" || variant === "span",
          "md:text-base text-sm leading-7 [&:not(:first-child)]:mt-6": variant === "p",
        },
        className
      )}
      {...props}
    />
  )
})

export default Typography
