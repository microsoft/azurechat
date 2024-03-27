import React from "react"
import Typography from "@/components/typography"

interface Props {
  title: string
  description: string
}

export const Callout = ({ title, description }: Props): React.JSX.Element => {
  return (
    <div className="max-w-lg border-l-4 border-accent bg-background p-6">
      <Typography variant="h3" className="mb-2 text-lg font-semibold">
        {title}
      </Typography>
      <Typography variant="p" className="text-base">
        {description}
      </Typography>
    </div>
  )
}

export default Callout
