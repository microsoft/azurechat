"use client"
import React from "react"

type Props = { size?: "xs" | "sm" | "md" | "lg" | "xl" }

const heightMap = {
  xs: "h-3",
  sm: "h-5",
  md: "h-7",
  lg: "h-10",
  xl: "h-14",
}
export const CardSkeleton: React.FC<Props> = ({ size }) => {
  return <div className={`${heightMap[size || "md"]} h- w-full animate-pulse rounded bg-gray-500`} />
}
