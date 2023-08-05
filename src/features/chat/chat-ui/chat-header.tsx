import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";
import { ChatType } from "../chat-services/models";

interface Prop {
  chatType: ChatType;
  disable: boolean;
}

export const ChatHeader: FC<Prop> = (props) => {
  return (
    <Tabs defaultValue={"GPT-3.5"}>
      <TabsList className="grid w-full grid-cols-2 h-12 items-stretch">
        <TabsTrigger disabled={props.disable} value="GPT-3.5">
          ⚡ GPT-3.5
        </TabsTrigger>
        <TabsTrigger disabled={props.disable} value="GPT-4">
          ✨ GPT-4
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
