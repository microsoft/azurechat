"use client"

import { Message } from "ai"
import { RefObject, useEffect } from "react"

export const useChatScrollAnchor = (chats: Message[], ref: RefObject<HTMLDivElement>, enabled: boolean): void => {
  useEffect(() => {
    if (ref && ref.current && enabled) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  }, [chats, ref, enabled])
}
