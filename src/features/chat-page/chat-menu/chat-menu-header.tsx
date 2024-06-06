import { CreateChatAndRedirect } from "../chat-services/chat-thread-service";
import { ChatContextMenu } from "./chat-context-menu";
import { NewChat } from "./new-chat";

export const ChatMenuHeader = () => {
  return (
    <div className="flex p-2 py-10 px-3 justify-center ">
      <form
        action={CreateChatAndRedirect}
        className="flex justify-between pr-3 w-full"
      >
        <NewChat />
        <ChatContextMenu />
      </form>
    </div>
  );
};
