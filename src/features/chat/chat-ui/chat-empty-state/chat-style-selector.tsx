import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Brush, CircleDot, Scale } from "lucide-react";
import { Award, FileText, SearchCheck, Hammer } from "lucide-react";
import { FC } from "react";
import { cn } from "@/lib/utils";
import { ChatScenario } from "../../chat-services/models";
import { useChatContext } from "../chat-context";

interface Prop {
  disable: boolean;
  orientation: string;
}

export const ChatStyleSelector: FC<Prop> = (props) => {
  const { onChatScenarioChange, chatBody } = useChatContext();

  return (
    <Tabs
      defaultValue={chatBody.chatScenario}
      onValueChange={(value) =>
        onChatScenarioChange(value as ChatScenario)
      }
    >
      <TabsList className={cn(
        "grid w-full items-stretch ",
        props.orientation === "vertical" ? "grid-cols-1 h-40" : "grid-cols-4 h-12"
      )}>
      <TabsTrigger
          value="career-planner-full"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Award size={20} /> Build my career plan
        </TabsTrigger>
        <TabsTrigger
          value="career-planner-resume"
          className="flex gap-2"
          disabled={props.disable}
        >
          <FileText size={20} /> Find my next role
        </TabsTrigger>
        <TabsTrigger
          value="role-finder"
          className="flex gap-2"
          disabled={props.disable}
        >
          <SearchCheck size={20} /> Assess my strengths
        </TabsTrigger>
        <TabsTrigger
          value="skills-assessment"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Hammer size={20} /> Forge my brand
        </TabsTrigger>
        {/* <TabsTrigger
          value="creative"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Brush size={20} /> Creative
        </TabsTrigger>
        <TabsTrigger
          value="balanced"
          className="flex gap-2"
          disabled={props.disable}
        >
          <Scale size={20} /> Balanced
        </TabsTrigger>
        <TabsTrigger
          value="precise"
          className="flex gap-2"
          disabled={props.disable}
        >
          <CircleDot size={20} /> Precise
        </TabsTrigger> */}
      </TabsList>
    </Tabs>
  );
};
