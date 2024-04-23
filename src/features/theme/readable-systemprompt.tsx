import React, { FC } from "react"

const SystemPrompt: FC = () => {
  const readableSystemPrompt = process.env.NEXT_PUBLIC_SYSTEM_PROMPT?.replace(/(?<!')\^(?!')/g, " ")

  return <p>{readableSystemPrompt}</p>
}

export default SystemPrompt
