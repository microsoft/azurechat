import { getTenantId, userHashedId } from "@/features/auth/helpers";
import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { ChatMessageModel, ChatRole, ChatSentiment, MESSAGE_ATTRIBUTE } from "@/features/chat/chat-services/models";
import { CosmosDBContainer } from "@/features/common/cosmos";
import { uniqueId } from "@/features/common/util";
import { ChatCompletionMessage, ChatCompletionRole } from "openai/resources";

export interface CosmosDBChatMessageHistoryFields {
  sessionId: string;
  userId: string;
  tenantId: string;
}

export class CosmosDBChatMessageHistory {
  private sessionId: string;
  private userId: string;
  private tenantId: string;

  constructor({ sessionId, userId, tenantId }: CosmosDBChatMessageHistoryFields) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.tenantId = tenantId;
  }

  async getMessages(): Promise<ChatCompletionMessage[]> {
    const chats = await FindAllChats(this.sessionId);
    return mapOpenAIChatMessages(chats);
  }

  async clear(): Promise<void> {
    const container = await CosmosDBContainer.getInstance().getContainer();
    await container.delete();
  }

  async addMessage(message: ChatCompletionMessage, citations: string = "") {
    const fetchedUserId = await userHashedId();
    const fetchedTenantId = await getTenantId();

    const modelToSave: ChatMessageModel = {
      id: uniqueId(),
      createdAt: new Date(),
      type: MESSAGE_ATTRIBUTE,
      isDeleted: false,
      content: message.content ?? "",
      role: mapChatCompletionRoleToChatRole(message.role),
      threadId: this.sessionId,
      userId: fetchedUserId,
      tenantId: fetchedTenantId,
      context: citations,
      systemPrompt: process.env.SYSTEM_PROMPT ?? "",
      feedback: "",
      sentiment: ChatSentiment.Neutral,
      reason: "",
      contextPrompt: "",
      contentSafetyWarning: ""
    };
    await UpsertChat(modelToSave);
  }
}

async function UpsertChat(chatModel: ChatMessageModel) {
  const container = await CosmosDBContainer.getInstance().getContainer();
  await container.items.upsert(chatModel);
}

function mapOpenAIChatMessages(
  messages: ChatMessageModel[]
  ): ChatCompletionMessage[] {
  return messages.map((message) => {
    return {
      role: message.role,
      content: message.content,
    };
  });
}

function mapChatCompletionRoleToChatRole(role: ChatCompletionRole): ChatRole {
  return role as unknown as ChatRole;
}
