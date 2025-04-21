import { useEffect, RefObject, useState } from "react";
import { useChat } from "@/features/chat-page/chat-store";

interface UseChatScrollAnchorProps {
  ref: RefObject<HTMLElement>;
  behavior?: ScrollBehavior;
}

export function useChatScrollAnchor({
  ref,
  behavior = "smooth",
}: UseChatScrollAnchorProps) {
  const { messages, loading } = useChat();
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [lastMessageRole, setLastMessageRole] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Only scroll when a new assistant message arrives (not when loading)
    if (
      messages.length > prevMessagesLength && 
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant" &&
      loading !== "loading"
    ) {
      // Scroll to bottom when new assistant message is received
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior,
      });
    }

    // Always update the previous message count
    setPrevMessagesLength(messages.length);
    
    // Update last message role if messages exist
    if (messages.length > 0) {
      setLastMessageRole(messages[messages.length - 1].role);
    }
  }, [messages, loading, ref, behavior, prevMessagesLength]);

  // Provide a function to allow manual scrolling when needed
  const scrollToBottom = () => {
    if (!ref.current) return;
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior,
    });
  };

  return { scrollToBottom };
}
