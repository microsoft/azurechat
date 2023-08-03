import { Message } from "ai";

export const CHAT_THREAD_ATTRIBUTE = "CHAT_THREAD";
export const MESSAGE_ATTRIBUTE = "CHAT_MESSAGE";

export interface ChatMessageModel {
  id: string;
  createdAt: Date;
  isDeleted: boolean;
  threadId: string;
  userId: string;
  content: string;
  role: ChatRole;
  type: "CHAT_MESSAGE";
}

export type ChatRole = "system" | "user" | "assistant" | "function";

export type ChatType = "simple" | "data" | "mssql";

export interface ChatThreadModel {
  id: string;
  name: string;
  model: string;
  createdAt: Date;
  userId: string;
  useName: string;
  isDeleted: boolean;
  chatType: ChatType;
  type: "CHAT_THREAD";
}

export interface PromptGPTBody {
  id: string; // thread id
  model: string; // model name
  chatType: ChatType;
}

export interface PromptGPTProps extends PromptGPTBody {
  messages: Message[];
}
