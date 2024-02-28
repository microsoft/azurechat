import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brush, CircleDot, Scale } from "lucide-react";
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FC } from "react";
import { ConversationStyle } from "../../chat-services/models";
import { useChatContext } from "../chat-context";

interface Prop {
  disable: boolean;
}

export const ChatStyleSelector: FC<Prop> = (props) => {
  const { onConversationStyleChange, chatBody } = useChatContext();

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div>
            <Tabs
              defaultValue={chatBody.conversationStyle}
              onValueChange={(value) =>
                onConversationStyleChange(value as ConversationStyle)
              }
            >
              <TabsList aria-label="Conversation Style" className="grid w-full grid-cols-3 h-12 items-stretch">
                <TabsTrigger
                  value="precise"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.conversationStyle === "precise"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <CircleDot size={20} aria-hidden="true"/> Precise
                </TabsTrigger>
                <TabsTrigger
                  value="balanced"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.conversationStyle === "balanced"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <Scale size={20} aria-hidden="true"/> Balanced
                </TabsTrigger>
                <TabsTrigger
                  value="creative"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.conversationStyle === "creative"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <Brush size={20} aria-hidden="true"/> Creative
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="bg-primary-foreground p-2 rounded-md shadow-lg text-sm text-foreground">
          <p>This controls the "temperature" of the model, with the values for each being 0.1, 0.5 and 1</p>
          <p><strong>Precise:</strong> Focused and detail-oriented conversations.</p>
          <p><strong>Balanced:</strong> A mix of precision and creativity.</p>
          <p><strong>Creative:</strong> Open-ended and imaginative discussions.</p>
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  );
};
