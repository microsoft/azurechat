"use client";

import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateChatThread } from "../chat-services/chat-thread-service";
import { useGlobalMessageContext } from "@/features/global-message/global-message-context";

export const NewChat = () => {
  const router = useRouter();
  const { showError } = useGlobalMessageContext();

  const startNewChat = async () => {
    try {
      const newChatThread = await CreateChatThread();
      if (newChatThread) {
        router.push("/chat/" + newChatThread.id);
      }
    } catch (e) {
      showError('Failed to start a new chat. Please try again later.');
    }
  };

  return (
    <Button
      className="gap-2 rounded-md w-[40px] h-[40px] p-1"
      variant="default"
      onClick={() => startNewChat()}
      aria-label="Start a new chat"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && startNewChat()}
    >
      <MessageSquarePlus size={40} strokeWidth={1.2} />
    </Button>
  );
};
