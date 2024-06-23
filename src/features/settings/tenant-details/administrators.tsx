"use client"
import { ChevronUpIcon } from "lucide-react"
import React, { useState } from "react"

import Typography from "@/components/typography"

export const Administrators: React.FC<{ administrators: string[] }> = ({ administrators = [] }) => {
  const DEFAULT_ITEMS_TO_SHOW = 6
  const [showMore, setShowMore] = useState(false)

  return (
    <Typography variant="h5" className="mb-4">
      Administrators:
      {administrators
        .sort((a, b) => a.localeCompare(b))
        .filter((_, index) => showMore || index < DEFAULT_ITEMS_TO_SHOW)
        .map(admin => (
          <div className="mt-2 rounded-md bg-altBackgroundShade p-2" key={admin}>
            <b>{admin}</b>
          </div>
        ))}
      {administrators.length > DEFAULT_ITEMS_TO_SHOW && (
        <div
          className={
            "mt-2 flex w-full transform cursor-pointer justify-center gap-2 rounded-md border-2 border-altBorder duration-300 animate-in"
          }
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show Less" : "Show More"}
          <ChevronUpIcon className={`h-6 w-6 transform duration-300 animate-in ${showMore ? "" : "rotate-180"}`} />
        </div>
      )}
    </Typography>
  )
}
