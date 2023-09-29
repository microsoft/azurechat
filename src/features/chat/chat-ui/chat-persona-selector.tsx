import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Laugh, Warehouse } from "lucide-react";
import { FC } from "react";
import { ChatPersona } from "../chat-services/models";

interface Prop {
  disable: boolean;
  chatPersona: ChatPersona;
  onChatPersonaChange?: (value: ChatPersona) => void;
}

export const ChatPersonaSelector: FC<Prop> = (props) => {
  return (
    <Tabs
      defaultValue={props.chatPersona}
      onValueChange={(value) =>
        props.onChatPersonaChange
          ? props.onChatPersonaChange(value as ChatPersona)
          : null
      }
    >
      <TabsList className="grid w-full grid-cols-3 h-12 items-stretch">
        <TabsTrigger
          value="friendly"
          className="flex gap-2"
          disabled={props.disable}
          title="Responses of the bot will be friendly"
        >
          <Heart size={20} /> Friendly
        </TabsTrigger>
        <TabsTrigger
          value="Professional"
          className="flex gap-2"
          disabled={props.disable}
          title="Responses of the bot will be professional"
        >
          <Warehouse size={20} /> Professional
        </TabsTrigger>
        <TabsTrigger
          value="humorous"
          className="flex gap-2"
          disabled={props.disable}
          title="Responses of the bot will be humorous"
        >
          <Laugh size={20} /> Humorous
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
