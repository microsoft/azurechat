import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC } from "react";
import { LLMModel } from "../chat-services/models";

interface Prop {
  disable: boolean;
  llmModel: LLMModel;
  onLLMModelChange?: (value: LLMModel) => void;
}

export const ChatModelSelector: FC<Prop> = (props) => {
  return (
    <Tabs
      defaultValue={props.llmModel}
      onValueChange={(value) =>
        props.onLLMModelChange
          ? props.onLLMModelChange(value as LLMModel)
          : null
      }
    >
      <TabsList className="grid w-full grid-cols-2 h-12 items-stretch">
        <TabsTrigger value="gpt-3.5" disabled={props.disable}>
          ⚡ GPT-3.5
        </TabsTrigger>
        <TabsTrigger value="gpt-4" disabled={props.disable}>
          ✨ GPT-4
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
