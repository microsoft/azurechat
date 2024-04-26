import { Message } from "ai"

export enum ConversationStyle {
  Creative = "creative",
  Balanced = "balanced",
  Precise = "precise",
}

export enum ConversationSensitivity {
  Official = "official",
  Sensitive = "sensitive",
  Protected = "protected",
}

export enum ChatType {
  Simple = "simple",
  Data = "data",
  MSSQL = "mssql",
  Audio = "audio",
}

export enum FeedbackType {
  None = "",
  HarmfulUnsafe = "harmful / unsafe",
  Untrue = "untrue",
  Unhelpful = "unhelpful",
  Inaccurate = "inaccurate",
}

export enum ChatRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
  Function = "function",
}

export enum ChatSentiment {
  Neutral = "neutral",
  Positive = "positive",
  Negative = "negative",
}

export enum ChatRecordType {
  Document = "CHAT_DOCUMENT",
  Message = "CHAT_MESSAGE",
  Thread = "CHAT_THREAD",
  Utility = "CHAT_UTILITY",
}

export interface ChatMessageModel {
  id: string
  createdAt: Date
  isDeleted: boolean
  chatThreadId: string
  /** @deprecated Legacy id - use chatThreadId instead */
  threadId?: string
  userId: string | undefined
  tenantId: string | undefined
  content: string
  type: ChatRecordType.Message
  role: ChatRole
  fleschKincaidScore?: number
}
export interface UserChatMessageModel extends ChatMessageModel {
  role: ChatRole.User
  context: string
  systemPrompt: string
  tenantPrompt: string
  userPrompt: string
  contentFilterResult?: unknown
}
export interface AssistantChatMessageModel extends ChatMessageModel {
  originalCompletion: string
  role: ChatRole.Assistant
  feedback: FeedbackType
  sentiment: ChatSentiment
  reason: string
}

export interface ChatThreadModel {
  id: string
  name: string
  previousChatName: string
  chatCategory: (typeof CATEGORIES)[number] | "Uncategorised" | "None"
  createdAt: Date
  userId: string
  tenantId: string
  useName: string
  chatThreadId: string
  isDeleted: boolean
  chatType: ChatType
  conversationSensitivity: ConversationSensitivity
  conversationStyle: ConversationStyle
  chatOverFileName: string
  type: ChatRecordType.Thread
  offenderId?: string
  isDisabled: boolean
  prompts: string[]
  selectedPrompt: string
  contentFilterTriggerCount?: number
}

export interface PromptBody {
  id: string
  chatType: ChatType
  conversationStyle: ConversationStyle
  conversationSensitivity: ConversationSensitivity
  chatOverFileName: string
  tenantId: string
  userId: string
  offenderId?: string
  chatThreadName?: string
}

export interface PromptMessage extends Message {
  contentFilterResult?: unknown
  sentiment?: ChatSentiment
  feedback?: FeedbackType
  reason?: string
}

export interface PromptProps extends PromptBody {
  messages: PromptMessage[]
  data: { completionId: string }
}

export interface ChatDocumentModel {
  id: string
  name: string
  chatThreadId: string
  userId: string
  tenantId: string
  isDeleted: boolean
  createdAt: Date
  contents?: string
  type: ChatRecordType.Document
}

export interface ChatUtilityModel {
  id: string
  name: string
  chatThreadId: string
  userId: string
  tenantId: string
  isDeleted: boolean
  createdAt: Date
  content: string
  role: ChatRole
  type: ChatRecordType.Utility
}

export const CATEGORIES = [
  "Information Processing and Management",
  "Communication and Interaction",
  "Decision Support and Advisory",
  "Educational and Training Services",
  "Operational Efficiency and Automation",
  "Finance and Banking",
  "Public Engagement and Services",
  "Innovation and Development",
  "Creative Assistance",
  "Lifestyle and Personal Productivity",
  "Entertainment and Engagement",
  "Emotional and Mental Support",
] as const
