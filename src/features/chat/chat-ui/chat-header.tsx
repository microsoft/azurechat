import { FC } from "react";
import { ChatType, ConversationStyle } from "../chat-services/models";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {
  chatType: ChatType;
  conversationStyle: ConversationStyle;
  fileName: string;
}

export const ChatHeader: FC<Prop> = (props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <ChatTypeSelector disable={true} chatType={props.chatType} />
        <ChatStyleSelector
          disable={true}
          conversationStyle={props.conversationStyle}
        />
      </div>
      <div className="flex gap-2">
        <p className="text-xs">{props.fileName}</p>
      </div>
    </div>
  );
};
