"use client";

import { ChatMessageOutputModel } from "@/features/chat/chat-service";
import { RefObject, useEffect } from "react";

export const useChatScrollAnchor = (
  chats: ChatMessageOutputModel[],
  ref: RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    if (ref && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [chats, ref]);
};
