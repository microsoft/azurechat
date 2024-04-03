import * as Tooltip from "@radix-ui/react-tooltip"
import { Brush, CircleDot, Scale } from "lucide-react"
import React from "react"
import { FC } from "react"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ConversationStyle } from "@/features/chat/models"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"
import { TooltipProvider } from "@/features/ui/tooltip-provider"

interface Prop {
  disable: boolean
}

export const ChatStyleSelector: FC<Prop> = props => {
  const { onConversationStyleChange, chatBody } = useChatContext()

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div>
            <Tabs
              defaultValue={chatBody.conversationStyle}
              onValueChange={value => onConversationStyleChange(value as ConversationStyle)}
            >
              <TabsList aria-label="Conversation Style" className="grid h-12 w-full grid-cols-3 items-stretch">
                <TabsTrigger
                  value="precise"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.conversationStyle === "precise"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <CircleDot size={20} aria-hidden="true" /> Precise
                </TabsTrigger>
                <TabsTrigger
                  value="balanced"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.conversationStyle === "balanced"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <Scale size={20} aria-hidden="true" /> Balanced
                </TabsTrigger>
                <TabsTrigger
                  value="creative"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.conversationStyle === "creative"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <Brush size={20} aria-hidden="true" /> Creative
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="rounded-md bg-primary-foreground p-2 text-sm text-foreground shadow-lg">
          <p>This controls the &quot;temperature&quot; of the model, with the values for each being 0.1, 0.5 and 1</p>
          <p>
            <strong>Precise:</strong> Focused and detail-oriented conversations.
          </p>
          <p>
            <strong>Balanced:</strong> A mix of precision and creativity.
          </p>
          <p>
            <strong>Creative:</strong> Open-ended and imaginative discussions.
          </p>
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  )
}
