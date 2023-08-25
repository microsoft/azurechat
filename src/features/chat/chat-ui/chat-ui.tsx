"use client";

import ChatInput from "@/components/chat/chat-input";
import ChatLoading from "@/components/chat/chat-loading";
import ChatRow from "@/components/chat/chat-row";
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { AI_NAME } from "@/features/theme/customise";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { FC, FormEvent, useRef, useState } from "react";
import {
  IndexDocuments,
  UploadDocument,
} from "../chat-services/chat-document-service";
import {
  ChatMessageModel,
  ChatThreadModel,
  ChatType,
  ConversationStyle,
  PromptGPTBody,
} from "../chat-services/models";
import { transformCosmosToAIModel } from "../chat-services/utils";
import { EmptyState } from "./chat-empty-state";
import { ChatHeader } from "./chat-header";

interface Prop {
  chats: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
}

export const ChatUI: FC<Prop> = (props) => {
  const { id, chatType, conversationStyle } = props.chatThread;

  const { data: session } = useSession();

  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [uploadButtonLabel, setUploadButtonLabel] = useState("");

  const [chatBody, setBody] = useState<PromptGPTBody>({
    id: id,
    chatType: chatType,
    conversationStyle: conversationStyle,
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

  const onChatTypeChange = (value: ChatType) => {
    setBody((e) => ({ ...e, chatType: value }));
  };

  const onConversationStyleChange = (value: ConversationStyle) => {
    setBody((e) => ({ ...e, conversationStyle: value }));
  };

  const onHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
  };

  const onFileChange = async (formData: FormData) => {
    try {
      setIsUploadingFile(true);
      setUploadButtonLabel("Uploading document...");
      formData.append("id", id);
      const file: File | null = formData.get("file") as unknown as File;
      const uploadResponse = await UploadDocument(formData);

      if (uploadResponse.success) {
        setUploadButtonLabel("Indexing document...");
        const indexResponse = await IndexDocuments(
          file.name,
          uploadResponse.response,
          id
        );

        if (indexResponse.success) {
          toast({
            title: "File upload",
            description: `${file.name} uploaded successfully.`,
          });
          setUploadButtonLabel("");
        } else {
          toast({
            variant: "destructive",
            description: indexResponse.error,
          });
        }
      } else {
        toast({
          variant: "destructive",
          description: "" + uploadResponse.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "" + error,
      });
    } finally {
      setIsUploadingFile(false);
      setUploadButtonLabel("");
    }
  };

  const ChatWindow = (
    <div className="h-full rounded-md overflow-y-auto " ref={scrollRef}>
      <div className="flex justify-center p-4">
        <ChatHeader
          chatType={chatBody.chatType}
          conversationStyle={chatBody.conversationStyle}
        />
      </div>
      <div className=" pb-[80px] flex flex-col justify-end flex-1">
        {messages.map((message, index) => (
          <ChatRow
            name={message.role === "user" ? session?.user?.name! : AI_NAME}
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
    <div className="h-full relative overflow-hidden flex-1 bg-card rounded-md shadow-md">
      {messages.length !== 0 ? (
        ChatWindow
      ) : (
        <EmptyState
          uploadButtonLabel={uploadButtonLabel}
          isUploadingFile={isUploadingFile}
          onFileChange={onFileChange}
          onConversationStyleChange={onConversationStyleChange}
          onChatTypeChange={onChatTypeChange}
          chatType={chatBody.chatType}
          conversationStyle={chatBody.conversationStyle}
        />
      )}

      <ChatInput
        isLoading={isLoading}
        value={input}
        handleInputChange={handleInputChange}
        handleSubmit={onHandleSubmit}
      />
    </div>
  );
};
