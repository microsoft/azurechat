"use client";

import { FC } from "react";
import { useChatContext } from "./chat-context";
import ChatInput from "./chat-input/chat-input";
import { ChatMessageContainer } from "./chat-message-container";
import { ChatMessageEmptyState } from "./chat-message-empty-state";

interface Prop {}

export const ChatUI: FC<Prop> = () => {
  const { messages } = useChatContext();

  return (
    <div className="h-full relative overflow-hidden flex-1 bg-card rounded-md shadow-md">
      {messages.length !== 0 ? (
        <ChatMessageContainer />
      ) : (
        <ChatMessageEmptyState />
      )}

      <ChatInput />
    </div>
  );
};
