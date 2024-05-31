"use client"

import { useWindowSize } from "@/features/ui/windowsize"

export const useButtonStyles = (): { iconSize: number; buttonClass: string } => {
  const { width } = useWindowSize()
  let iconSize = 10
  let buttonClass = "h-9"

  if (width < 768) {
    buttonClass = "h-7"
  } else if (width >= 768 && width < 1024) {
    iconSize = 12
  } else if (width >= 1024) {
    iconSize = 16
  }

  return { iconSize, buttonClass }
}
