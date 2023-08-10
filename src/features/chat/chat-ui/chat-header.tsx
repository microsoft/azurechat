import { FC } from "react";
import { ChatType, ConversationStyle, LLMModel } from "../chat-services/models";
import { ChatModelSelector } from "./chat-model-selector";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {
  chatType: ChatType;
  conversationStyle: ConversationStyle;
  llmModel: LLMModel;
}

export const ChatHeader: FC<Prop> = (props) => {
  return (
    <div className="flex gap-2">
      <ChatTypeSelector disable={true} chatType={props.chatType} />
      <ChatModelSelector disable={true} llmModel={props.llmModel} />

      <ChatStyleSelector
        disable={true}
        conversationStyle={props.conversationStyle}
      />
    </div>
  );
};
