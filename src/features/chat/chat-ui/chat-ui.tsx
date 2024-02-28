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
    <div className="col-span-6 md:col-span-5 lg:col-span-4 xl:col-span-5 relative overflow-hidden flex-1 bg-altBackground shadow-md text-text sm:text-lg lg:text-xl h-full">
    {messages.length !== 0 ? (
      <ChatMessageContainer chatId={""} sentiment={""} threadId={""}/>
    ) : (
      <ChatMessageEmptyState/>
    )}

    <ChatInput />

  </div>

  );
};

