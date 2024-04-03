import * as Tooltip from "@radix-ui/react-tooltip"
import React from "react"

interface TooltipProviderProps {
  children: React.ReactNode
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <Tooltip.Provider>{children}</Tooltip.Provider>
}
