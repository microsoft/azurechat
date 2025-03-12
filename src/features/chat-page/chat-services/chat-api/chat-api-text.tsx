"use server";
import "server-only";

import { OpenAIInstance } from "@/features/common/services/openai";

export const ChatApiText = async (
  userMessage: string
) => {
  const openAI = OpenAIInstance();

  const response = await openAI.chat.completions.create({
    model: "",
    max_completion_tokens: 1000,
    stream: false,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: userMessage }],
      },
    ],
  });

  return response.choices[0].message.content as string;
};
