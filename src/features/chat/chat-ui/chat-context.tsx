"use client";

import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import { Message } from "ai";
import { UseChatHelpers, useChat } from "ai/react";
import React, { FC, createContext, useState } from "react";
import {
  ChatMessageModel,
  ChatThreadModel,
  PromptGPTBody,
} from "../chat-services/models";
import { transformCosmosToAIModel } from "../chat-services/utils";
import { useSpeechContext } from "../chat-speech/speech-context";
import { FileState, useFileState } from "./chat-file/use-file-state";

interface ChatContextProps extends UseChatHelpers {
  id: string;
  setChatBody: (body: PromptGPTBody) => void;
  chatBody: PromptGPTBody;
  fileState: FileState;
}

const ChatContext = createContext<ChatContextProps | null>(null);

interface Prop {
  children: React.ReactNode;
  id: string;
  chats: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
}

export const ChatProvider: FC<Prop> = (props) => {
  const { showError } = useGlobalMessageContext();
  const fileState = useFileState();

  const [chatBody, setBody] = useState<PromptGPTBody>({
    id: props.chatThread.id,
    chatType: props.chatThread.chatType,
    conversationStyle: props.chatThread.conversationStyle,
    chatOverFileName: props.chatThread.chatOverFileName,
  });

  const { textToSpeech, isMicrophoneUsed, resetMicrophoneUsed } =
    useSpeechContext();

  const response = useChat({
    onError,
    id: props.id,
    body: chatBody,
    initialMessages: transformCosmosToAIModel(props.chats),
    onFinish: async (lastMessage: Message) => {
      if (isMicrophoneUsed) {
        await textToSpeech(lastMessage.content);
        resetMicrophoneUsed();
      }
    },
  });

  const setChatBody = (body: PromptGPTBody) => {
    setBody(body);
  };

  function onError(error: Error) {
    showError(error.message, response.reload);
  }

  return (
    <ChatContext.Provider
      value={{ ...response, setChatBody, chatBody, fileState, id: props.id }}
    >
      {props.children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("ChatContext is null");
  }

  return context;
};
