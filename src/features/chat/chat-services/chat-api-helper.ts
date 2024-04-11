import { AzureCogDocumentIndex, similaritySearchVectorWithScore } from "./azure-cog-search/azure-cog-vector-store"
import { DocumentSearchModel } from "./azure-cog-search/azure-cog-vector-store"

import { userSession } from "@/features/auth/helpers"
import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { AI_NAME } from "@/features/theme/theme-config"

async function buildUserContextPrompt(): Promise<string> {
  const session = await userSession()
  const displayName = session?.name
  const contextPrompt = session?.contextPrompt
  if (!displayName) return ""
  let prompt = `\nNote, you are chatting to ${displayName}`
  if (contextPrompt && contextPrompt.length > 0) {
    prompt += ` and they have provided the below context:\n${contextPrompt}\n`
  }
  return prompt
}

export const buildSimpleChatSystemPrompt = async (): Promise<string> => {
  const userContextPrompt = await buildUserContextPrompt()
  const systemPrompt =
    process.env.SYSTEM_PROMPT ||
    `-You are QChat who is a helpful AI Assistant developed to assist Queensland government employees in their day-to-day tasks.
  - You will provide clear and concise queries, and you will respond with polite and professional answers.
  - You will answer questions truthfully and accurately.
  - You will respond to questions in accordance with rules of Queensland government.`
  return systemPrompt + userContextPrompt
}

export const buildDataChatSystemPrompt = (): string => `You are ${AI_NAME} who is a helpful AI Assistant.`
export const buildDataChatContextPrompt = ({
  context,
  userQuestion,
}: {
  context: string
  userQuestion: string
}): string => {
  return `
- Given the following extracted parts of a document, create a final answer. \n
- If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n
----------------\n
context:\n
${context}
----------------\n
question: ${userQuestion}`
}

export const findRelevantDocuments = async (
  query: string,
  chatThreadId: string
): Promise<(AzureCogDocumentIndex & DocumentSearchModel)[]> => {
  const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
  const relevantDocuments = await similaritySearchVectorWithScore(query, 10, userId, chatThreadId, tenantId)
  return relevantDocuments
}
