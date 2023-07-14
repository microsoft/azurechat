import {
  ChatThreadModel,
  EnsureChatThreadIsForCurrentUser,
  UpsertChatThread,
} from "@/features/chat/chat-thread-service";
import {
  AzureOpenAI,
  ChatCompletionRequestMessage,
} from "../common/azure-openai";
import {
  ChatMessageOutputModel,
  FindAllChats,
  UpsertChat,
} from "./chat-service";

export const PromptGPT = async (
  threadID: string,
  message: ChatMessageOutputModel,
  model: string
) => {
  const chatThread = await EnsureChatThreadIsForCurrentUser(threadID);
  const { content } = message as ChatMessageOutputModel;
  const _messages = await FindAllChats(threadID);
  await updateChatTitle(chatThread, _messages, model, content);

  const azureOpenAI = new AzureOpenAI({
    onCompletion: async (output) =>
      await updateUserAndAssistant(threadID, content, output),
  });

  const history = buildMemory(_messages, 10);
  const useMessage: ChatCompletionRequestMessage = {
    content: content,
    role: "user",
  };

  const systemMessage: ChatCompletionRequestMessage = {
    content: `-You are AzureChatGPT who is a helpful AI Assistant.
- You will provide clear and concise queries, and you will respond with polite and professional answers.
- You will answer questions truthfully and accurately.`,
    role: "system",
  };

  const stream = await azureOpenAI.createChatCompletion({
    messages: [systemMessage, ...history, useMessage],
    stream: true,
  });

  return new Response(stream);
};

const updateChatTitle = async (
  chatThread: ChatThreadModel,
  messages: ChatMessageOutputModel[],
  modelName: string,
  userMessage: string
) => {
  if (messages.length === 0) {
    await UpsertChatThread({
      ...chatThread,
      model: modelName,
      name: userMessage.substring(0, 30),
    });
  }
};

const buildMemory = (chats: ChatMessageOutputModel[], memorySize: number) => {
  const memory = [
    ...chats.slice(memorySize * -1).map((m) => {
      const chat: ChatCompletionRequestMessage = {
        content: m.content,
        role: m.role,
      };
      return chat;
    }),
  ];

  return memory;
};

const updateUserAndAssistant = async (
  threadID: string,
  userQuestion: string,
  assistantResponse: string
) => {
  await UpsertChat({
    content: userQuestion,
    threadId: threadID,
    role: "user",
  });
  await UpsertChat({
    content: assistantResponse,
    threadId: threadID,
    role: "assistant",
  });
};
