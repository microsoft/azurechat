import * as Tooltip from "@radix-ui/react-tooltip"
import { Shield, ShieldAlert, ShieldX } from "lucide-react"
import { FC } from "react"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ConversationSensitivity } from "@/features/chat/models"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"
import { TooltipProvider } from "@/features/ui/tooltip-provider"

interface Prop {
  disable: boolean
}

export const ChatSensitivitySelector: FC<Prop> = ({ disable }) => {
  const { onConversationSensitivityChange, chatBody } = useChatContext()

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div>
            <Tabs
              defaultValue={chatBody.conversationSensitivity}
              onValueChange={value => onConversationSensitivityChange(value as ConversationSensitivity)}
            >
              <TabsList aria-label="Conversation Sensitivity" className="grid size-full grid-cols-3 items-stretch">
                <TabsTrigger
                  value="official"
                  className="flex items-center justify-center gap-2"
                  disabled={disable}
                  role="tab"
                  aria-selected={chatBody.conversationSensitivity === "official"}
                  aria-disabled={disable ? "true" : undefined}
                >
                  <Shield size={16} aria-hidden="true" /> Official
                </TabsTrigger>
                <TabsTrigger
                  value="sensitive"
                  className="flex items-center justify-center gap-2"
                  disabled={disable}
                  role="tab"
                  aria-selected={chatBody.conversationSensitivity === "sensitive"}
                  aria-disabled={disable ? "true" : undefined}
                >
                  <ShieldAlert size={16} aria-hidden="true" /> Sensitive
                </TabsTrigger>
                <TabsTrigger
                  value="protected"
                  className="flex items-center justify-center gap-2 hover:cursor-not-allowed"
                  disabled={true}
                  role="tab"
                  aria-selected={chatBody.conversationSensitivity === "protected"}
                  aria-disabled="true"
                >
                  <ShieldX size={16} aria-hidden="true" /> Protected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="rounded-md bg-primary-foreground p-4 text-foreground shadow-lg">
          <Typography variant="p">
            <strong>Official:</strong> Verified and formal conversations.
            <br />
            <strong>Sensitive:</strong> May contain delicate information.
            <br />
            <strong>Protected (Disabled):</strong> Protected documents or topics covered in Protected documents should
            <br />
            not be uploaded to this service. For more information see your Information Management
            <br />
            Officer or the Queensland State Archives.
          </Typography>
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  )
}
