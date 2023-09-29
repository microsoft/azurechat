import { FC } from "react";
import { PromptGPTBody } from "../chat-services/models";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";
import { ChatLengthSelector } from "./chat-length-selector";
import { ChatPersonaSelector } from "./chat-persona-selector";

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
        <ChatLengthSelector
          disable={true}
          chatlength={props.chatBody.chatLength}
        />
        <ChatPersonaSelector
          disable={true}
          chatPersona={props.chatBody.chatPersona}
        />
      </div>
      <div className="flex gap-2 h-2">
        <p className="text-xs">{props.chatBody.chatOverFileName}</p>
      </div>
    </div>
  );
};
