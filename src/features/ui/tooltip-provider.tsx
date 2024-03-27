import React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"

interface TooltipProviderProps {
  children: React.ReactNode
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <Tooltip.Provider>{children}</Tooltip.Provider>
}
