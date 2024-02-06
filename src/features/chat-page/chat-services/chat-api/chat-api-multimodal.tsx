"use server";
import "server-only";

import { OpenAIVisionInstance } from "@/features/common/services/openai";
import { ChatCompletionStreamingRunner } from "openai/resources/beta/chat/completions";
import { ChatThreadModel } from "../models";
export const ChatApiMultimodal = (props: {
  chatThread: ChatThreadModel;
  userMessage: string;
  file: string;
  signal: AbortSignal;
}): ChatCompletionStreamingRunner => {
  const { chatThread, userMessage, signal, file } = props;

  const openAI = OpenAIVisionInstance();

  return openAI.beta.chat.completions.stream(
    {
      model: "",
      stream: true,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content:
            chatThread.personaMessage +
            "\n You are an expert in extracting insights from images that are uploaded to the chat. \n You will answer questions about the image that is provided.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            {
              type: "image_url",
              image_url: {
                url: file,
              },
            },
          ],
        },
      ],
    },
    { signal }
  );
};
