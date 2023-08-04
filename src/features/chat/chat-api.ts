import { ChatData } from "./chat-data/chat-data-api";
import { PromptGPTProps } from "./chat-services/models";
import { ChatSimple } from "./chat-simple/chat-simple-api";

export const PromptGPT = async (props: PromptGPTProps) => {
  if (props.chatType === "simple") {
    return await ChatSimple(props);
  } else if (props.chatType === "data") {
    return await ChatData(props);
  }
};
