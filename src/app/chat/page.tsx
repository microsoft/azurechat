import { Card } from "@/components/ui/card";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { StartNewChat } from "@/features/chat/chat-ui/start-new-chat";
import { redirect } from "next/navigation";

export default async function Home() {
  const chats = await FindAllChatThreadForCurrentUser();
  if (chats.length > 0) {
    redirect(`/chat/${chats[0].id}`);
  }

  return (
    <Card className="h-full items-center flex justify-center">
      <StartNewChat />
    </Card>
  );
}
