"use server"
import "server-only"
import { CATEGORIES, ChatThreadModel } from "@/features/chat/models"

import { UpsertChatThread } from "./chat-thread-service"
import { GenericChatAPI } from "./generic-chat-api"

async function generateChatName(chatMessage: string): Promise<string> {
  const apiName = "generateChatName"
  try {
    const name = await GenericChatAPI(apiName, {
      messages: [
        {
          role: "system",
          content: `- create a succinct title, limited to five words and 20 characters, for the following chat """${chatMessage}""" conversation with a generative AI assistant:
                - this title should effectively summarise the main topic or theme of the chat.
                - it will be used in the app's navigation interface, so it should be easily understandable and reflective of the chat's content
                to help users quickly grasp what the conversation was about.`,
        },
      ],
    })

    if (name) {
      return name.replace(/^"+|"+$/g, "")
    }
    return name || "New Chat by Error"
  } catch (e) {
    // TODO handle error
    console.error("Error generating chat name:", e)
    return "New Chat by Error"
  }
}

async function generateChatCategory(
  chatMessage: string,
  previousAttempt: string | null = null
): Promise<ChatThreadModel["chatCategory"]> {
  const apiName = "generateChatCategory"

  let prompt = `Based on the content of the following message: "${chatMessage}", please categorise it into only one of the specified categories. The response must strictly be one of these exact phrases:\n${CATEGORIES.join("\n")}\nExample response: "Information Processing and Management"`

  if (previousAttempt !== null) {
    prompt = `The previous attempt to categorise the following message was not successful. The response "${previousAttempt}" did not match any of the expected categories. Please review the message again and categorise it correctly using only one of the specified categories. The expected response must be one of these exact phrases:\n${CATEGORIES.join("\n")}\nMessage: "${chatMessage}"\nExample response: "Information Processing and Management"`
  }

  try {
    const rawCategory = await GenericChatAPI(apiName, { messages: [{ role: "system", content: prompt }] })

    const category = (rawCategory || "").replace(/^"|"$/g, "")
    if (CATEGORIES.map(String).includes(category)) return category as ChatThreadModel["chatCategory"]

    if (previousAttempt === null) return await generateChatCategory(chatMessage, rawCategory)
  } catch (_e) {
    console.log(`Error generating chat category: ${_e}`)
  }
  return "Uncategorised"
}

export async function UpdateChatThreadIfUncategorised(
  chatThread: ChatThreadModel,
  content: string
): Promise<ChatThreadModel> {
  try {
    if (["Uncategorised", "None"].includes(chatThread.chatCategory)) {
      const [chatCategory, name, previousChatName] = await Promise.all([
        generateChatCategory(content),
        generateChatName(content),
        StoreOriginalChatName(chatThread.name),
      ])

      const response = await UpsertChatThread({ ...chatThread, chatCategory, name, previousChatName })

      if (response.status !== "OK") {
        throw new Error(response.errors.join(", "))
      }
    } else {
      //TOD handle console log
      console.log("Chat thread already has a category, skipping category generation.")
    }
    return chatThread
  } catch (e) {
    // TODO handle error
    console.error("Failed to update chat thread due to an error:", e) // Log caught error
    throw e
  }
}

function StoreOriginalChatName(currentChatName: string): string {
  let previousChatName: string = ""
  if (currentChatName !== previousChatName) {
    console.log(`Storing previous chat name: ${currentChatName}`)
    previousChatName = currentChatName
  }
  return previousChatName
}
