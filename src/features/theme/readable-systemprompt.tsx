import React, { FC } from "react"

import Typography from "@/components/typography"

const SystemPrompt: FC = () => {
  const readableSystemPrompt = process.env.NEXT_PUBLIC_SYSTEM_PROMPT?.replace(/(?<!')\^(?!')/g, " ")

  return <Typography variant="p">{readableSystemPrompt}</Typography>
}

export default SystemPrompt
