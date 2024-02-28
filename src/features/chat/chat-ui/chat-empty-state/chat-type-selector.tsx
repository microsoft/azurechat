import React, { useEffect, useState } from 'react';
import { FC } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioLines, FileText, MessageCircle } from "lucide-react";
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChatType } from "../../chat-services/models";
import { useChatContext } from "../chat-context";
import { useSession } from "next-auth/react";

interface Prop {
  disable: boolean;
}

const tenants = process.env.FEATURE_TRANSCRIBE_TENANTS?.split(',') || [];

export const ChatTypeSelector: FC<Prop> = (props) => {
  const { chatBody, onChatTypeChange } = useChatContext();
  const { data: session } = useSession();
  const [isAllowedTenant, setIsAllowedTenant] = useState(false);

  useEffect(() => {
    if (session) {
      const tenantId = session.user?.tenantId;
      setIsAllowedTenant(tenants.includes(tenantId));
    }
  }, [session]);

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div>
            <Tabs
              defaultValue={chatBody.chatType}
              onValueChange={(value) => {
                onChatTypeChange(value as ChatType);
              }}
            >
              <TabsList aria-label="Conversation Type" className="grid w-full grid-cols-3 h-12 items-stretch">
                <TabsTrigger
                  value="simple"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.chatType === "simple"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <MessageCircle size={20} aria-hidden="true"/> General
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="flex gap-2"
                  disabled={props.disable}
                  role="tab"
                  aria-selected={chatBody.chatType === "data"}
                  aria-disabled={props.disable ? "true" : undefined}
                >
                  <FileText size={20} aria-hidden="true"/> File
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="flex gap-2"
                  disabled={!isAllowedTenant || props.disable}
                  role="tab"
                  aria-selected={chatBody.chatType === "audio"}
                  aria-disabled={!isAllowedTenant || props.disable ? "true" : undefined}
                >
                  <AudioLines size={20} aria-hidden="true"/> Transcribe
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="bg-primary-foreground p-2 rounded-md shadow-lg text-sm text-foreground">
          <p><strong>General</strong> - chats are turn by turn conversations with the QChat Assistant.</p>
          <p><strong>File</strong> - Upload PDF files to QChat for questions or task completion based on it.</p>
          {isAllowedTenant && <p><strong>Transcription</strong> - Available for authorised agencies.</p>}
          {!isAllowedTenant && <p><strong>Transcription</strong> - is restricted to authorised agencies.</p>}
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  );
};
