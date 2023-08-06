import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { FindChatThreadByID } from "@/features/chat/chat-services/chat-thread-service";
import { ChatUI } from "@/features/chat/chat-ui/chat-ui";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: { id: string } }) {
  const items = await FindAllChats(params.id);
  const thread = await FindChatThreadByID(params.id);

  if (thread.length === 0) {
    notFound();
  }

  return <ChatUI chats={items} chatThread={thread[0]} />;
}
