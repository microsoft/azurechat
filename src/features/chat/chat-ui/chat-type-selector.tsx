import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageCircle } from "lucide-react";
import { FC } from "react";
import { ChatType } from "../chat-services/models";

interface Prop {
  chatType: ChatType;
  disable: boolean;
  onChatTypeChange?: (value: ChatType) => void;
}

export const ChatTypeSelector: FC<Prop> = (props) => {
  return (
    <Tabs
      defaultValue={props.chatType}
      onValueChange={(value) =>
        props.onChatTypeChange
          ? props.onChatTypeChange(value as ChatType)
          : null
      }
    >
      <TabsList className="grid w-full grid-cols-2 h-12 items-stretch">
        <TabsTrigger
          value="simple"
          className="flex gap-2"
          disabled={props.disable}
        >
          <MessageCircle size={20} /> General
        </TabsTrigger>
        <TabsTrigger
          value="data"
          className="flex gap-2"
          disabled={props.disable}
        >
          <FileText size={20} /> File
        </TabsTrigger>
        {/* <TabsTrigger
          value="mssql"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Database size={20} /> Database
        </TabsTrigger> */}
      </TabsList>
    </Tabs>
  );
};
