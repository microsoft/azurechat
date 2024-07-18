import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-button text-buttonText hover:bg-buttonHover hover:underline",
        accent: "bg-accent text-buttonText hover:bg-altButtonHover hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-error",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-button hover:text-buttonText",
        negative: "hover:bg-destructive hover:text-buttonText",
        positive: "hover:bg-success hover:text-buttonText",
        link: "text-text underline-offset-4 hover:underline",
        code: "absolute right-2 top-2 hidden h-7 gap-1 px-2 text-base capitalize focus:bg-accent focus:text-link group-hover:flex",
        login: "max-w-[200px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "size-7 rounded",
        md: "rounded",
        lg: "h-11 rounded-md px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ButtonLinkVariant = cn(
  buttonVariants({ variant: "ghost" }),
  "p-0 w-full h-12 w-12 flex items-center justify-center "
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ariaLabel: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ariaLabel, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        aria-label={ariaLabel || props.children?.toString()}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, ButtonLinkVariant, buttonVariants }
