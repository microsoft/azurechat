import * as Switch from "@radix-ui/react-switch"
import { cva } from "class-variance-authority"
import React from "react"

import Typography from "@/components/typography"
import { cn } from "@/lib/utils"

const switchVariants = cva(
  "w-[42px] h-[25px] rounded-full relative shadow-sm outline-none cursor-pointer transition-colors duration-200",
  {
    variants: {
      state: {
        on: "bg-success",
        off: "bg-error",
        destructiveOn: "bg-success",
        destructiveOff: "bg-error",
      },
    },
    defaultVariants: {
      state: "off",
    },
  }
)

const thumbVariants = cva(
  "block w-[21px] h-[21px] bg-white rounded-full shadow-md transition-transform duration-200 will-change-transform",
  {
    variants: {
      state: {
        on: "translate-x-[19px]",
        off: "translate-x-[2px]",
        destructiveOn: "translate-x-[19px]",
        destructiveOff: "translate-x-[2px]",
      },
    },
    defaultVariants: {
      state: "off",
    },
  }
)

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof Switch.Root> {
  label: string
  labelClassName?: string
  thumbClassName?: string
  variant?: "default" | "destructive"
  isChecked?: boolean
}

const switchStyle = { WebkitTapHighlightColor: "rgba(0, 0, 0, 0)" }
const getState = (variant: string, isChecked: boolean): "destructiveOn" | "destructiveOff" | "on" | "off" => {
  if (variant === "destructive" && isChecked) return "destructiveOn"
  if (variant === "destructive" && !isChecked) return "destructiveOff"
  if (isChecked) return "on"
  return "off"
}
const SwitchComponent = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, labelClassName, className, thumbClassName, variant = "default", isChecked = false, ...props }, ref) => {
    const state = getState(variant, isChecked)

    return (
      <div className="flex items-center">
        <Typography variant="p" className={cn("pr-[10px]", labelClassName)} id={`${props.id}-label`}>
          {label}
        </Typography>
        <Switch.Root
          ref={ref}
          className={cn(switchVariants({ state }), className)}
          {...props}
          role="switch"
          aria-checked={isChecked}
          aria-labelledby={`${props.id}-label`}
          style={switchStyle}
        >
          <Switch.Thumb className={cn(thumbVariants({ state }), thumbClassName)} />
        </Switch.Root>
      </div>
    )
  }
)

SwitchComponent.displayName = "SwitchComponent"

export { SwitchComponent, switchVariants, thumbVariants }
