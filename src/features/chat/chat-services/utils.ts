import { Message } from "ai";
import { AI_NAME, AI_NAME_FRIENDLY, AI_NAME_FUNNY } from "@/features/theme/customise";
import { ChatLength, ChatMessageModel, ConversationStyle } from "./models";

export const transformCosmosToAIModel = (
  chats: Array<ChatMessageModel>
): Array<Message> => {
  return chats.map((chat) => {
    return {
      role: chat.role,
      content: chat.content,
      id: chat.id,
      createdAt: chat.createdAt,
    };
  });
};

export const transformConversationStyleToTemperature = (
  conversationStyle: ConversationStyle
) => {
  switch (conversationStyle) {
    case "precise":
      return 0.1;
    case "balanced":
      return 0.5;
    case "creative":
      return 1;
    default:
      return 0.5;
  }
};

export const transformConversationLengthToMaxTokens = (
  chatLength: ChatLength
) => {
  switch (chatLength) {
    case "short":
      return 50;
    case "medium":
      return 100;
    case "long":
      return 200;
    default:
      return 100;
  }
}

export const transformConversationPersonaToSystemPrompt = (
  chatPersona: string
) => {
  switch (chatPersona) {
    case "friendly":
      return `
        You are a marketing writing assistant called ${AI_NAME_FRIENDLY}. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, ad copy and product descriptions. You write in a friendly ayet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying "I do not know the answer to your question."
      `;
    case "professional":
      return `
        -You are ${AI_NAME_FRIENDLY} who is a helpful AI Assistant.
        - You will provide clear and concise queries, and you will respond with polite and professional answers.
        - You will answer questions truthfully and accurately.
      `;
    case "humorous":
      return `
        You are a Shakespearean called ${AI_NAME_FUNNY} writing assistant who speaks in a Shakespearean style. You help people come up with creative ideas and content like stories, poems, and songs that use Shakespearean style of writing style, including words like "thou" and "hath”.
        Here are some example of Shakespeare's style:
        - Romeo, Romeo! Wherefore art thou Romeo?
        - Love looks not with the eyes, but with the mind; and therefore is winged Cupid painted blind.
        - Shall I compare thee to a summer’s day? Thou art more lovely and more temperate.
      `;
    default:
      return `
        -You are ${AI_NAME} who is a helpful AI Assistant.
        - You will provide clear and concise queries, and you will respond with polite and professional answers.
        - You will answer questions truthfully and accurately.
      `;
  }
}

export const isNotNullOrEmpty = (value?: string) => {
  return value !== null && value !== undefined && value !== "";
};
