"use server"

import { ReactElement } from "react"

import { APP_NAME } from "@/app-global"

import Typography from "@/components/typography"
import { simpleSearch } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store"

export const CitationAction = async (_previousState: unknown, formData: FormData): Promise<ReactElement> => {
  const id = formData.get("id") as string
  const chatThreadId = formData.get("chatThreadId") as string
  const userId = formData.get("userId") as string
  const tenantId = formData.get("tenantId") as string
  const name = formData.get("name") as string

  const baseFilter = `chatThreadId eq '${chatThreadId}' and userId eq '${userId}' and tenantId eq '${tenantId}'`

  const idFilter = {
    filter: `${baseFilter} and id eq '${id}'`,
  }

  let result = await simpleSearch(userId, chatThreadId, tenantId, idFilter)

  if (result.length === 0) {
    const documentIdFilter = {
      filter: `${baseFilter} and metadata eq '${id}'`,
    }
    result = await simpleSearch(userId, chatThreadId, tenantId, documentIdFilter)
  }

  if (result.length === 0) {
    const fileNameFilter = {
      filter: `${baseFilter} and fileName eq '${name}'`,
    }
    result = await simpleSearch(userId, chatThreadId, tenantId, fileNameFilter)
  }

  if (result.length === 0) return <div>Not found</div>

  const firstResult = result[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-sm p-2">
        <Typography variant="h2">File name: {firstResult.fileName}</Typography>
        <br />
        <Typography variant="h2">File content:</Typography>
        <Typography variant="p">{firstResult.pageContent}</Typography>
        <br />
        <Typography variant="h2">Understanding Citations:</Typography>
        <Typography variant="p">
          The citation presented is a specific snippet from your document, selected by {APP_NAME} through
          Retrieval-Augmented Generation (RAG) for its relevance to your question. If the snippets seem unrelated, it
          might suggest that {APP_NAME} needs more context or clearer questions to accurately pinpoint the right
          information. This method aims to deliver focused and relevant insights, but sometimes it may need further
          clarification to match your question precisely.
        </Typography>
      </div>
    </div>
  )
}
