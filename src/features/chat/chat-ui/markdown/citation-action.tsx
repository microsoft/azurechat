"use server"

import { ReactElement } from "react"

import Typography from "@/components/typography"
import { simpleSearch } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store"

export const CitationAction = async (_previousState: unknown, formData: FormData): Promise<ReactElement> => {
  const id = formData.get("id") as string
  const chatThreadId = formData.get("chatThreadId") as string
  const userId = formData.get("userId") as string
  const tenantId = formData.get("tenantId") as string

  const filter = {
    filter: `id eq '${id}' and chatThreadId eq '${chatThreadId}' and userId eq '${userId}' and tenantId eq '${tenantId}'`,
  }
  const result = await simpleSearch(userId, chatThreadId, tenantId, filter)

  if (result.length === 0) return <div>Not found</div>
  const firstResult = result[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-sm p-2">
        <Typography variant="h2">File name</Typography>
        <Typography variant="p">{firstResult.metadata}</Typography>
        <br />
        <Typography variant="h2">File content:</Typography>
        <Typography variant="p">{firstResult.pageContent}</Typography>
      </div>
    </div>
  )
}
