import { Card } from "@/components/ui/card";
import { NewChat } from "@/features/chat/chat-menu/new-chat";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { redirect } from "next/navigation";

export default async function Home() {
  const chats = await FindAllChatThreadForCurrentUser();
  if (chats.length > 0) {
    redirect(`/chat/${chats[0].id}`);
  }

  return (
    <Card className="h-full items-center flex justify-center">
      <NewChat></NewChat>
    </Card>
  );
}
