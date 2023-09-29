import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, FileText, ScrollText } from "lucide-react";
import { FC } from "react";
import { ChatLength } from "../chat-services/models";

interface Prop {
  disable: boolean;
  chatlength: ChatLength;
  onChatLengthChange?: (value: ChatLength) => void;
}

export const ChatLengthSelector: FC<Prop> = (props) => {
  return (
    <Tabs
      defaultValue={props.chatlength}
      onValueChange={(value) =>
        props.onChatLengthChange
          ? props.onChatLengthChange(value as ChatLength)
          : null
      }
    >
      <TabsList className="grid w-full grid-cols-3 h-12 items-stretch">
        <TabsTrigger
          value="short"
          className="flex gap-2"
          disabled={props.disable}
          title="Responses of the bot will be short"
        >
          <Text size={20} /> Short
        </TabsTrigger>
        <TabsTrigger
          value="medium"
          className="flex gap-2"
          disabled={props.disable}
          title="Responses of the bot will be medium in length"
        >
          <FileText size={20} /> Medium
        </TabsTrigger>
        <TabsTrigger
          value="long"
          className="flex gap-2"
          disabled={props.disable}
          title="Responses of the bot will be long"
        >
          <ScrollText size={20} /> Long
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
