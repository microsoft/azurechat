import { PromptGPTProps } from "@/features/chat/models"

import { ChatAPIData } from "./chat-api-data"
import { ChatAPISimple } from "./chat-api-simple"

export const ChatAPIEntry = async (props: PromptGPTProps): Promise<Response> => {
  const dataChatTypes = ["data", "mssql", "audio"]

  if (props.chatType === "simple") {
    return await ChatAPISimple(props)
  } else if (dataChatTypes.includes(props.chatType)) {
    return await ChatAPIData(props)
  } else {
    return await ChatAPISimple(props)
  }
}
