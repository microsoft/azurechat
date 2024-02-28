import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldAlert, ShieldX } from "lucide-react";
import { FC } from "react";
import { ConversationSensitivity } from "../../chat-services/models";
import { useChatContext } from "../chat-context";

interface Prop {
  disable: boolean;
}

export const ChatSensitivitySelector: FC<Prop> = ({ disable }) => {
  const { chatBody } = useChatContext();

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div>
            <Tabs defaultValue={chatBody.conversationSensitivity}>
              <TabsList aria-label="Conversation Sensitivity" className="grid w-full grid-cols-3 h-12 items-stretch">
                <TabsTrigger
                  value="official"
                  className="flex gap-2 items-center justify-center"
                  disabled={disable}
                  role="tab"
                  aria-selected={chatBody.conversationSensitivity === "official"}
                  aria-disabled={disable ? "true" : undefined}
                >
                  <Shield size={20} aria-hidden="true" /> Official
                </TabsTrigger>
                <TabsTrigger
                  value="sensitive"
                  className="flex gap-2 items-center justify-center"
                  disabled={disable}
                  role="tab"
                  aria-selected={chatBody.conversationSensitivity === "sensitive"}
                  aria-disabled={disable ? "true" : undefined}
                >
                  <ShieldAlert size={20} aria-hidden="true" /> Sensitive
                </TabsTrigger>
                <TabsTrigger
                  value="protected"
                  className="flex gap-2 items-center justify-center"
                  disabled={true}
                  role="tab"
                  aria-selected={chatBody.conversationSensitivity === "protected"}
                  aria-disabled="true"
                >
                  <ShieldX size={20} aria-hidden="true"/> Protected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="bg-primary-foreground p-2 rounded-md shadow-lg text-sm text-foreground">
          <p><strong>Official:</strong> Verified and formal conversations.</p>
          <p><strong>Sensitive:</strong> May contain delicate information.</p>
          <p><strong>Protected (Disabled):</strong> Protected documents or topics covered in Protected documents should not be uploaded to this service.</p>
          <p>For more information see your Information Management Officer or the Queensland State Archives.</p>
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>  
  );
};
