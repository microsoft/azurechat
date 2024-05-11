import * as React from "react"

import Typography from "@/components/typography"

import { Button } from "./button"

interface BannerProps {
  title: string
  description: string
  ctaText: string
  onClick: () => void
}

export const Banner: React.FC<BannerProps> = ({ title, description, ctaText, onClick }) => {
  return (
    <div className="max-h-400 size-full bg-pattern-bg bg-repeat p-8">
      <div className="bl-accent bl-2 bg-backgroundShade">
        <Typography variant="h1" className="text-2xl font-bold">
          {title}
        </Typography>
      </div>
      <Typography variant="p" className="text-lg">
        {description}
      </Typography>
      <Button onClick={onClick}>{ctaText}</Button>
    </div>
  )
}
