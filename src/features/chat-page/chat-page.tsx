"use client";
import { Alert, AlertDescription, AlertTitle } from "@/features/ui/alert";
import { AlertCircle } from "lucide-react";
import { ChatInput } from "@/features/chat-page/chat-input/chat-input";
import { chatStore, useChat } from "@/features/chat-page/chat-store";
import { ChatLoading } from "@/features/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/features/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/features/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/features/ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "@/features/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef } from "react";
import { ExtensionModel } from "../extensions-page/extension-services/models";
import { ChatHeader } from "./chat-header/chat-header";
import {
  ChatDocumentModel,
  ChatMessageModel,
  ChatThreadModel,
} from "./chat-services/models";
import MessageContent from "./message-content";

interface ChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatPage: FC<ChatPageProps> = (props) => {
  const { data: session } = useSession();

  useEffect(() => {
    chatStore.initChatSession({
      chatThread: props.chatThread,
      messages: props.messages,
      userName: session?.user?.name!,
    });
  }, [props.messages, session?.user?.name, props.chatThread]);

  const { messages, loading } = useChat();

  const current = useRef<HTMLDivElement>(null);

  const maxMessages = 15;

  useChatScrollAnchor({ ref: current });

  return (
    <main className="flex flex-1 relative flex-col">
      <ChatHeader
        chatThread={props.chatThread}
        chatDocuments={props.chatDocuments}
        extensions={props.extensions}
      />
  
      {messages.length > maxMessages && (
        <Alert className="text-x bg-primary bg-orange-400">
        <AlertCircle size={20} />
        <AlertTitle>Warning: Too Many Messages</AlertTitle>
        <AlertDescription className="text">
            This chat has more than {maxMessages} messages. Long chats cost more money because the whole context with all messages is sent to the LLM when clicking on submit. Please open a new chat whenever the context or topic switches.              </AlertDescription>
        </Alert>
      )}
      <ChatMessageContainer ref={current}>
        <ChatMessageContentArea>
          {messages.map((message) => {
            return (
              <ChatMessageArea
                key={message.id}
                profileName={message.name}
                role={message.role}
                onCopy={() => {
                  navigator.clipboard.writeText(message.content);
                }}
                profilePicture={
                  message.role === "assistant"
                    ? "/ai-icon.png"
                    : session?.user?.image
                }
              >
                <MessageContent message={message} />
              </ChatMessageArea>
            );
          })}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      <ChatInput />
    </main>
  );
};
