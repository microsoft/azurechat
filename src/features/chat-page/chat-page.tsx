"use client";
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
import Link from "next/link";
import {
  ChatDocumentModel,
  ChatMessageModel,
  ChatThreadModel,
} from "./chat-services/models";
import MessageContent from "./message-content";
import Disclaimer from "../ui/chat/disclaimer";
import { AlignCenter } from "lucide-react";
import { useTheme } from "next-themes";

interface ChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
}

export const ChatPage: FC<ChatPageProps> = (props) => {
  const { data: session } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    chatStore.initChatSession({
      chatThread: props.chatThread,
      messages: props.messages,
      userName: session?.user?.name!,
    });
  }, [props.messages, session?.user?.name, props.chatThread]);

  const { messages, loading } = useChat();

  const current = useRef<HTMLDivElement>(null);

  useChatScrollAnchor({ ref: current });

  return (
    <main className="flex flex-1 relative flex-col">
      <ChatHeader
        chatThread={props.chatThread}
        chatDocuments={props.chatDocuments}
        extensions={props.extensions}
      />
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
                    ? theme === 'dark' ? "/logo-COMAU-white.png" : "/logo-COMAU.png"
                    : session?.user?.image
                }
                theme={theme}
              >
                <MessageContent message={message} />
              </ChatMessageArea>
            );
          })}
          {loading === "loading" && <ChatLoading />}
        </ChatMessageContentArea>
      </ChatMessageContainer>
      
      <div className="flex flex-col items-center mt-4">
         <ChatInput />

       <div className="mt-2 text-center text-sm">
        <Disclaimer text={<>COMAU AICO generated content may be inaccurate. <Link target="_blank" href="https://drive.google.com/file/d/1OXkt4Z9hVoy4rXGFBOhzR9e0LJers5fJ/view">Refered Policy</Link>.</>}/>
       </div>
      </div> 
    </main>
  );
};
