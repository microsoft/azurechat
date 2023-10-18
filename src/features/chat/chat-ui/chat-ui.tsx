"use client";

import { FC } from "react";
import { useChatContext } from "./chat-context";
import { ChatMessageEmptyState } from "./chat-empty-state/chat-message-empty-state";
import ChatInput from "./chat-input/chat-input";
import { ChatMessageContainer } from "./chat-message-container";

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

      <div className="absolute bottom-0 w-full flex justify-center text-sm text-muted-foreground">
        Chat powered by Azure Open AI. It may produce inaccurate information. Treat information provided as talking points only.
      </div>
      <ChatInput />
    </div>
  );
};
