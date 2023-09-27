"use client";
import { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { StartNewChat } from "@/features/chat/chat-ui/start-new-chat";

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      const chats = await FindAllChatThreadForCurrentUser();
    };
    fetchData();
  }, );
  return (
    <Card className="h-full items-center flex justify-center flex-1">
      <StartNewChat />
    </Card>
  );
}
