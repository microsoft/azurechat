"use client";

import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { ChatMessageOutputModel } from "./chat-service";

type UseChatOptions = {
  api?: string;
  id?: string;
  initialInput?: string;
  messages?: ChatMessageOutputModel[];
  onError?: (error: Error) => void;
  onComplete?: (messages: ChatMessageOutputModel[]) => void;
};

export const useAzureOpenAIChat = (options: UseChatOptions = {}) => {
  const chatId = options.id!;
  const api = options.api || "/api/chat/" + chatId;
  const [messages, setMessages] = useState(options.messages || []);
  const [lastMessage, setLastMessage] = useState<ChatMessageOutputModel | null>(
    null
  );
  const [body, setBody] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [input, setInput] = useState(options.initialInput || "");

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (!input) return;

    const newUserMessage: ChatMessageOutputModel = {
      id: nanoid(),
      threadId: chatId,
      createdAt: new Date(),
      content: input,
      role: "user",
      isDeleted: false,
    };

    setLastMessage(newUserMessage);
    await promptChat(newUserMessage);
  };

  const reTry = async () => {
    if (!lastMessage) return;

    const _messages = messages.filter((m) => m.id !== lastMessage.id);
    setMessages(_messages);
    await promptChat(lastMessage);
  };

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  const promptChat = async (message: ChatMessageOutputModel) => {
    setIsLoading(true);
    setInput("");
    const _messages = [...messages, message];
    setMessages(_messages);
    let completeResponse = "";

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response: Response = await fetch(api, {
        signal: abortController.signal,
        method: "POST",
        body: JSON.stringify({ message: message, ...body }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      const assistantId = nanoid();
      const createdAt = new Date();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunkValue = decoder.decode(value);
        completeResponse += chunkValue;
        updateMessages(
          [
            ..._messages,
            {
              id: assistantId,
              threadId: chatId,
              content: completeResponse,
              createdAt,
              role: "assistant",
              isDeleted: false,
            },
          ],
          false
        );

        if (abortControllerRef.current === null) {
          reader.cancel();
          break;
        }
      }

      //update the message to ensure it's complete
      updateMessages(
        [
          ..._messages,
          {
            id: assistantId,
            threadId: chatId,
            content: completeResponse,
            createdAt,
            role: "assistant",
            isDeleted: false,
          },
        ],
        true
      );

      abortControllerRef.current = null;
    } catch (err) {
      abortControllerRef.current = null;
      if (options.onError && err instanceof Error) {
        options.onError(err);
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const updateMessages = (
    newMessage: ChatMessageOutputModel[],
    messageIsComplete: boolean
  ) => {
    const uniqueChats = newMessage.filter(
      (element, index, self) =>
        index === self.findIndex((t) => t.id === element.id)
    );

    setMessages([...uniqueChats]);

    if (options.onComplete && messageIsComplete) {
      options.onComplete(uniqueChats);
    }
  };

  return {
    handleSubmit,
    handleInputChange,
    input,
    messages,
    isLoading,
    chatId,
    stop,
    body,
    setBody,
    reTry,
  };
};
