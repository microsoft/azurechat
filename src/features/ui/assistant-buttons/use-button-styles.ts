"use client"

import { useWindowSize } from "@/features/ui/windowsize"

export const useButtonStyles = (): { iconSize: number; buttonClass: string } => {
  const { width } = useWindowSize()
  if (width < 768) return { iconSize: 10, buttonClass: "h-7" }
  if (width >= 768 && width < 1024) return { iconSize: 12, buttonClass: "h-9" }
  if (width >= 1024) return { iconSize: 16, buttonClass: "h-9" }
  return { iconSize: 10, buttonClass: "h-9" }
}
