import { Message } from "ai";

export const CHAT_DOCUMENT_ATTRIBUTE = "CHAT_DOCUMENT";
export const CHAT_THREAD_ATTRIBUTE = "CHAT_THREAD";
export const MESSAGE_ATTRIBUTE = "CHAT_MESSAGE";
export const CHAT_UTILITY_ATTRIBUTE = "CHAT_UTILITY";

export enum ConversationStyle {
  Creative = "creative",
  Balanced = "balanced",
  Precise = "precise",
};

export enum ConversationSensitivity {
  Official = "official",
  Sensitive = "sensitive",
  Protected = "protected",
};

export enum ChatType {
  Simple = "simple",
  Data = "data",
  MSSQL = "mssql",
  Audio = "audio",
};

export enum FeedbackType {
  HarmfulUnsafe = "harmful / unsafe",
  Untrue = "untrue",
  Unhelpful = "unhelpful",
};

export enum ChatRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
  Function = "function",
};

export enum ChatSentiment {
  Neutral = "neutral",
  Positive = "positive",
  Negative = "negative",
};

export interface ChatMessageModel {
  id: string;
  createdAt: Date;
  isDeleted: boolean;
  threadId: string;
  userId: string | undefined;
  tenantId: string | undefined;
  content: string;
  role: ChatRole;
  context: string;
  type: "CHAT_MESSAGE";
  feedback: string;
  sentiment: ChatSentiment;
  reason: string;
  systemPrompt: string;
  contextPrompt: string;
  contentSafetyWarning: string;
};

export interface ChatThreadModel {
  id: string;
  name: string;
  previousChatName: string;
  chatCategory: string;
  createdAt: Date;
  userId: string;
  tenantId: string;
  useName: string;
  chatThreadId: string;
  isDeleted: boolean;
  chatType: ChatType;
  conversationSensitivity: ConversationSensitivity;
  conversationStyle: ConversationStyle;
  chatOverFileName: string;
  type: "CHAT_THREAD";
  offenderId?: string;
  isDisabled: boolean;
  contentSafetyWarning: string;
};

export interface PromptGPTBody {
  id: string;
  chatType: ChatType;
  conversationStyle: ConversationStyle;
  conversationSensitivity: ConversationSensitivity;
  chatOverFileName: string;
  tenantId: string;
  userId: string;
  offenderId?: string;
};

export interface PromptGPTProps extends PromptGPTBody {
  messages: Message[];
};

export interface ChatDocumentModel {
  id: string;
  name: string;
  chatThreadId: string;
  userId: string;
  tenantId: string;
  isDeleted: boolean;
  createdAt: Date;
  type: "CHAT_DOCUMENT";
};

export interface ChatUtilityModel {
  id: string;
  name: string;
  chatThreadId: string;
  userId: string;
  tenantId: string;
  isDeleted: boolean;
  createdAt: Date;
  content: string;
  role: ChatRole;
  type: "CHAT_UTILITY";
};

export interface ServerActionResponse<T> {
  success: boolean;
  error: string;
  response: T;
}

export interface ChatUtilities {
  id: string;
  chatThreadId: string;
  userId: string;
  tenantId: string;
  promptButton: string;
};
