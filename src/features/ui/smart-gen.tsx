"use client"
import { Sparkles, Sparkle } from "lucide-react"
import React, { useState } from "react"

import { useButtonStyles } from "@/features/ui/assistant-buttons/use-button-styles"
import { Button } from "@/features/ui/button"

export const SmartGen: React.FC<{
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => Promise<void>
}> = ({ onClick }) => {
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
      type="button"
      ariaLabel="Rewrite with suggestions"
      variant={"outline"}
      size={"default"}
      className={`${buttonClass}`}
      title="Rewrite with suggestions"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? <Sparkles size={iconSize} className="animate-spin" /> : <Sparkle size={iconSize} />}
    </Button>
  )
}
