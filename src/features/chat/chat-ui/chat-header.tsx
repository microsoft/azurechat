import { FC } from "react";
import { ChatType, ConversationStyle, PromptGPTBody } from "../chat-services/models";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {
  chatBody: PromptGPTBody;
}

export const ChatHeader: FC<Prop> = (props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <ChatTypeSelector disable={true} chatType={props.chatBody.chatType} />
        <ChatStyleSelector
          disable={true}
          conversationStyle={props.chatBody.conversationStyle}
        />
      </div>
      <div className="flex gap-2 h-2">
        <p className="text-xs">{props.chatBody.chatOverFileName}</p>
      </div>
    </div>
  );
};
