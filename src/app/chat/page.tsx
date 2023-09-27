"use client";
import { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { StartNewChat } from "@/features/chat/chat-ui/start-new-chat";
import { redirect } from "next/navigation";

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      const chats = await FindAllChatThreadForCurrentUser();
      if (chats.length > 0) {
        redirect(`/chat/${chats[0].id}`);
      }
    };
    fetchData();
  }, );
  return (
    <Card className="h-full items-center flex justify-center flex-1">
      <StartNewChat />
    </Card>
  );
}
