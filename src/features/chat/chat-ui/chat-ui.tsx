"use client";

import { FC } from "react";
import { useChatContext } from "./chat-context";
import { ChatMessageEmptyState } from "./chat-empty-state/chat-message-empty-state";
import ChatInput from "./chat-input/chat-input";
import { ChatMessageContainer } from "./chat-message-container";

interface Prop {
  chatId: string;
  onPromptSelected: () => string;
};

export const ChatUI: FC<Prop> = ({ chatId, onPromptSelected }) => {
  const { messages } = useChatContext();

  return (
    <div className="h-full relative overflow-hidden flex-1 bg-card rounded-md shadow-md">
    {messages.length !== 0 ? (
      <ChatMessageContainer/>
    ) : (
      <ChatMessageEmptyState onPromptSelected={onPromptSelected} />
    )}

    <ChatInput />

  </div>

  );
};