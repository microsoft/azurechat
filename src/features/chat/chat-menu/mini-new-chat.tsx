"use client";

import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FindChatThreadByTitleAndEmpty, UpdateChatThreadCreatedAt } from "../chat-services/chat-thread-service";
import { useGlobalMessageContext } from "@/features/global-message/global-message-context";

export const MiniNewChat = () => {
  const router = useRouter();
  const { showError } = useGlobalMessageContext();

  const startNewChat = async () => {
    const title = "New Chat";

    try {
      const existingThread = await FindChatThreadByTitleAndEmpty(title);
      
      if (existingThread) {
        await UpdateChatThreadCreatedAt(existingThread.id);
        router.push(`/chat/${existingThread.id}`);
      } else {
        router.push("/chat/");
      }
    } catch (error) {
      showError('Failed to start a new chat. Please try again later.');
    }
  };

  return (
    <div className="lg:hidden absolute top-4 right-4">
      <Button
        aria-label="Start a new chat"
        role="button"
        tabIndex={0}
        className="gap-2 rounded-md w-[40px] h-[40px] p-1"
        variant="default"
        onClick={startNewChat}
        onKeyDown={(e) => e.key === 'Enter' && startNewChat()}
      >
        <MessageSquarePlus size={40} strokeWidth={1.2} aria-hidden="true" />
      </Button>
    </div>
  );
};