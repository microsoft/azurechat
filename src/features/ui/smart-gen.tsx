"use client"
import { Sparkles, Sparkle } from "lucide-react"
import React, { useState } from "react"

import { useButtonStyles } from "@/features/ui/assistant-buttons/use-button-styles"
import { Button, ButtonProps } from "@/features/ui/button"

export const SmartGen = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => Promise<void> }
>(({ onClick, ...props }, ref) => {
  const [isLoading, setIsLoading] = useState(false)
  const { iconSize, buttonClass } = useButtonStyles()

  async function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined): Promise<void> {
    e?.preventDefault()
    e?.stopPropagation()
    setIsLoading(true)
    await onClick(e).finally(() => setIsLoading(false))
  }

  return (
    <Button
      {...props}
      ref={ref}
      type={props.type || "button"}
      variant={props.variant || "outline"}
      size={props.size || "default"}
      className={buttonClass}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? <Sparkles size={iconSize} className="animate-spin" /> : <Sparkle size={iconSize} />}
    </Button>
  )
})

SmartGen.displayName = "SmartGen"
