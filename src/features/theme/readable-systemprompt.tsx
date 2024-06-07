import React, { FC } from "react"

import Typography from "@/components/typography"

const SystemPrompt: FC = () => {
  const readableSystemPrompt = process.env.NEXT_PUBLIC_SYSTEM_PROMPT?.replace(/(?<!')\^(?!')/g, " ")

  return (
    <Typography variant="h6" className="rounded-md bg-altBackgroundShade p-4 text-justify">
      {readableSystemPrompt}
    </Typography>
  )
}

export default SystemPrompt
