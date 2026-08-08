import { CreateChatAndRedirect } from "../chat-services/chat-thread-service";
import { ChatContextMenu } from "./chat-context-menu";
import { NewChat } from "./new-chat";

export const ChatMenuHeader = () => {
  return (
    <div className="flex p-2 items-center">
      <form action={CreateChatAndRedirect} className="flex-1 flex gap-1 items-center">
        <NewChat />
        <ChatContextMenu />
      </form>
    </div>
  );
};
