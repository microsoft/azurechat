"use client";

import ChatInput from "@/components/chat/chat-input";
import ChatLoading from "@/components/chat/chat-loading";
import ChatRow from "@/components/chat/chat-row";
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useAzureOpenAIChat } from "@/features/chat/chat-hook";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { FC, FormEvent, useRef } from "react";
import { ChatMessageOutputModel } from "./chat-service";

interface Prop {
  chats: Array<ChatMessageOutputModel>;
  model: string;
}

export const ChatUI: FC<Prop> = (props) => {
  const { id } = useParams();
  const { data: session } = useSession();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setBody,
    reTry,
  } = useAzureOpenAIChat({
    id: id,
    messages: props.chats,
    onError,
  });

  const { toast } = useToast();

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
            reTry();
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

  return (
    <Card className="h-full relative">
      <div className="h-full rounded-md overflow-y-auto" ref={scrollRef}>
        <div className="flex justify-center p-4">
          <Tabs
            defaultValue={props.model ?? "GPT-3.5"}
            onValueChange={onValueChange}
          >
            <TabsList className="grid w-full grid-cols-2 h-12 items-stretch">
              <TabsTrigger disabled={messages.length !== 0} value="GPT-3.5">
                ⚡ GPT-3.5
              </TabsTrigger>
              <TabsTrigger disabled={messages.length !== 0} value="GPT-4">
                ✨ GPT-4
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
      <ChatInput
        isLoading={isLoading}
        value={input}
        handleInputChange={handleInputChange}
        handleSubmit={onHandleSubmit}
      />
    </Card>
  );
};
