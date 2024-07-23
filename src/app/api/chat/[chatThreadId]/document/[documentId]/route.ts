import { NextRequest } from "next/server"
import * as yup from "yup"

import { userSession } from "@/features/auth/helpers"
import { UpdateChatDocument } from "@/features/chat/chat-services/chat-document-service"

const documentUpdateSchema = yup.object({
  updatedContent: yup.string().required(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { chatThreadId: string; documentId: string } }
): Promise<Response> {
  try {
    const user = await userSession()
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const { chatThreadId, documentId } = params
    const body = await request.json()
    const validatedData = await documentUpdateSchema.validate(body, { abortEarly: false, stripUnknown: true })
    const { updatedContent } = validatedData

    const result = await UpdateChatDocument(documentId, chatThreadId, updatedContent)
    if (result.status !== "OK")
      return new Response(JSON.stringify({ error: "Failed to update document" }), { status: 500 })

    return new Response(JSON.stringify(result.response), { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}
