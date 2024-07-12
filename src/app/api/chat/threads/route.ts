import { NextRequest } from "next/server"

import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service"

export async function GET(_request: NextRequest): Promise<Response> {
  const threadsResult = await FindAllChatThreadForCurrentUser()
  if (threadsResult.status === "OK") {
    return new Response(JSON.stringify(threadsResult.response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (threadsResult.status === "NOT_FOUND")
    return new Response(JSON.stringify({ error: "Application settings not found" }), { status: 404 })

  return new Response(JSON.stringify({ error: "Failed to retrieve application settings" }), { status: 500 })
}
