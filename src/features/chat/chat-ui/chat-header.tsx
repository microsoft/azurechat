import { FC } from "react";
import { useChatContext } from "./chat-context";
import { ChatSelectedOptions } from "./chat-header-display/chat-selected-options";
import { MiniNewChat } from "../chat-menu/mini-new-chat";

interface Prop {}

export const ChatHeader: FC<Prop> = (props) => {
  const { chatBody } = useChatContext();

  return (
    <div className="flex flex-col gap-2">
      <ChatSelectedOptions />
      <div className="flex gap-2 h-2">
        <p className="text-sm" tabIndex={0}>{chatBody.chatOverFileName}</p>
      </div>
      <MiniNewChat />
    </div>
  );
};
