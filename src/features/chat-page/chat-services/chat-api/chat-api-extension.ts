"use server";
import "server-only";

import { OpenAIInstance } from "@/features/common/services/openai";
import { FindExtensionByID } from "@/features/extensions-page/extension-services/extension-service";
import { RunnableToolFunction } from "openai/lib/RunnableFunction";
import { ChatCompletionStreamingRunner } from "openai/resources/beta/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ChatThreadModel } from "../models";
export const ChatApiExtensions = async (props: {
  chatThread: ChatThreadModel;
  userMessage: string;
  history: ChatCompletionMessageParam[];
  extensions: RunnableToolFunction<any>[];
  signal: AbortSignal;
}): Promise<ChatCompletionStreamingRunner> => {
  const { userMessage, history, signal, chatThread, extensions } = props;

  const openAI = OpenAIInstance();
  const systemMessage = await extensionsSystemMessage(chatThread);
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: chatThread.personaMessage + "\n" + systemMessage,
    },
    ...history,
    {
      role: "user",
      content: userMessage,
    },
  ];

  // Azure OpenAI rejects an empty tools array, so fall back to a plain
  // stream when no extensions are registered. This also keeps basic chat
  // working on deployments whose model has no tool-calling support.
  if (extensions.length === 0) {
    return openAI.beta.chat.completions.stream(
      {
        model: "",
        stream: true,
        messages,
      },
      { signal: signal }
    );
  }

  return openAI.beta.chat.completions.runTools(
    {
      model: "",
      stream: true,
      messages,
      tools: extensions,
    },
    { signal: signal }
  );
};

const extensionsSystemMessage = async (chatThread: ChatThreadModel) => {
  let message = "";

  for (const e of chatThread.extension) {
    const extension = await FindExtensionByID(e);
    if (extension.status === "OK") {
      message += ` ${extension.response.executionSteps} \n`;
    }
  }

  return message;
};
