"use client";

import ChatInput from "@/components/chat/chat-input";
import ChatLoading from "@/components/chat/chat-loading";
import ChatRow from "@/components/chat/chat-row";
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor";
import { Card } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { FC, FormEvent, useRef, useState } from "react";
import { ChatMessageModel, PromptGPTBody } from "../chat-services/models";
import { transformCosmosToAIModel } from "../chat-services/utils";
import { EmptyState } from "./chat-empty-state";
import { ChatHeader } from "./chat-header";

interface Prop {
  chats: Array<ChatMessageModel>;
  model: string;
}

export const ChatUI: FC<Prop> = (props) => {
  const { id } = useParams();
  const { data: session } = useSession();
  const [chatBody, setBody] = useState<PromptGPTBody>({
    id: id,
    model: "GPT-3.5",
    chatType: "simple",
  });

  const { toast } = useToast();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    reload,
    isLoading,
  } = useChat({
    onError,
    id,
    body: chatBody,
    initialMessages: transformCosmosToAIModel(props.chats),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useChatScrollAnchor(messages, scrollRef);

  function onError(error: Error) {
    toast({
      variant: "destructive",
      description: error.message,
      action: (
        <ToastAction
          altText="Try again"
          onClick={() => {
            reload();
          }}
        >
          Try again
        </ToastAction>
      ),
    });
  }

  const onValueChange = (value: string) => {
    setBody((e) => ({ ...e, model: value }));
  };

  const onHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
  };

  const ChatWindow = (
    <div className=" h-full rounded-md overflow-y-auto" ref={scrollRef}>
      <div className="flex justify-center p-4">
        <ChatHeader disable={messages.length === 0} chatType="data" />
      </div>
      <div className=" pb-[80px] ">
        {messages.map((message, index) => (
          <ChatRow
            name={
              message.role === "user" ? session?.user?.name! : "AzureChatGPT"
            }
            profilePicture={
              message.role === "user" ? session?.user?.image! : "/ai-icon.png"
            }
            message={message.content}
            type={message.role}
            key={index}
          />
        ))}
        {isLoading && <ChatLoading />}
      </div>
    </div>
  );

  return (
    <Card className="h-full relative overflow-hidden">
      {messages.length !== 0 ? (
        ChatWindow
      ) : (
        <EmptyState onValueChange={(chat) => onValueChange(chat)} />
      )}
      <ChatInput
        isLoading={isLoading}
        value={input}
        handleInputChange={handleInputChange}
        handleSubmit={onHandleSubmit}
      />
    </Card>
  );
};
