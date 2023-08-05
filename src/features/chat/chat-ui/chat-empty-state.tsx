import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";
import { ChatType } from "../chat-services/models";
interface Prop {
  onValueChange: (value: ChatType) => void;
}
export const EmptyState: FC<Prop> = (props) => {
  return (
    <div className="flex w-full items-center container mx-auto max-w-2xl justify-center h-full gap-2">
      <div className="flex flex-col gap-2 flex-1 items-start">
        <img
          alt="Bubble gum cycling"
          src="/bubble-gum-cycling.png"
          className=""
        />
      </div>
      <div className="gap-5 flex flex-col items-start  flex-1">
        <h2 className="text-4xl font-bold">Hello</h2>
        <p className="text-sm text-muted-foreground">
          Start by just typing your message in the box below. You can also
          personalise the chat by making changes to the settings.
        </p>
        <Tabs
          defaultValue={"GPT-3.5"}
          onValueChange={(value) => props.onValueChange(value as ChatType)}
        >
          <TabsList className="grid w-full grid-cols-2 h-12 items-stretch">
            <TabsTrigger value="GPT-3.5">⚡ GPT-3.5</TabsTrigger>
            <TabsTrigger value="GPT-4">✨ GPT-4</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
