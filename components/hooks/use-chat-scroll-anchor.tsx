"use client";

import { Message } from "ai";
import { RefObject, useEffect } from "react";

export const useChatScrollAnchor = (
  chats: Message[],
  ref: RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    if (ref && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [chats, ref]);
};
