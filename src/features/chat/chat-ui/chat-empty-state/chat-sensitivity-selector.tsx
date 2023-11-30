import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brush, CircleDot, Scale } from "lucide-react";
import { FC } from "react";
import { ConversationSensitivity } from "../../chat-services/models";
import { useChatContext } from "../chat-context";

interface Prop {
  disable: boolean;
}

export const ChatSensitivitySelector: FC<Prop> = (props) => {
  const { onConversationSensitivityChange, chatBody } = useChatContext();

  return (
    <Tabs
      defaultValue={chatBody.ConversationSensitivity}
      onValueChange={(value) =>
        onConversationSensitivityChange(value as ConversationSensitivity)
      }
    >
      <TabsList className="grid w-full grid-cols-3 h-12 items-stretch">
        <TabsTrigger
          value="official"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Brush size={20} /> Official
        </TabsTrigger>
        <TabsTrigger
          value="sensitive"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Scale size={20} /> Sensitive
        </TabsTrigger>
        <TabsTrigger
          value="protected"
          className="flex gap-2"
          disabled={props.disable}
        >
          <CircleDot size={20} /> Protected
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
