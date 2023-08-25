import { FC } from "react";
import { ChatType, ConversationStyle } from "../chat-services/models";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {
  chatType: ChatType;
  conversationStyle: ConversationStyle;
}

export const ChatHeader: FC<Prop> = (props) => {
  return (
    <div className="flex gap-2">
      <ChatTypeSelector disable={true} chatType={props.chatType} />
      <ChatStyleSelector
        disable={true}
        conversationStyle={props.conversationStyle}
      />
    </div>
  );
};
