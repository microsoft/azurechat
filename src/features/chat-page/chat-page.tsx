"use client";
import React, { FC, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ChatInput } from "./chat-input/chat-input";
import { chatStore, useChat } from "./chat-store";
import { ChatLoading } from "../ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "../ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "../ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "../ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "../ui/chat/chat-message-area/use-chat-scroll-anchor";
import { useSession } from "next-auth/react";
import { ExtensionModel } from "../extensions-page/extension-services/models";
import { PersonaModel } from "../persona-page/persona-services/models";
import { PersonaCard } from "../persona-page/persona-card/persona-card";
import { ExtensionCard } from "../extensions-page/extension-card/extension-card";
import { ChatHeader } from "./chat-header/chat-header";
import {
  ChatDocumentModel,
  ChatMessageModel,
  ChatThreadModel,
} from "./chat-services/models";
import MessageContent from "./message-content";
import Disclaimer from "../ui/chat/disclaimer";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../ui/lib";

interface ChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread: ChatThreadModel;
  chatDocuments: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
  personas: Array<PersonaModel>;
  initialMessage?: string;
}

const MemoizedChatHeader = React.memo(ChatHeader);

export const ChatPage: FC<ChatPageProps> = (props) => {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [profilePicture, setProfilePicture] = useState("/logo.png");

  useEffect(() => {
    chatStore.initChatSession({
      chatThread: props.chatThread,
      messages: props.messages,
      userName: session?.user?.name!,
    });
    setProfilePicture(theme === "dark" ? "/Logo-white.png" : "/logo.png");
  }, [props.chatThread, props.messages, session?.user?.name, theme]);

  const { messages, loading } = useChat();

  const current = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useChatScrollAnchor({ ref: current });

  // Process initialMessage if provided in URL
  useEffect(() => {
    if (props.initialMessage && formRef.current) {
      // Set input value and submit the form
      const decodedMessage = decodeURIComponent(props.initialMessage);
      chatStore.updateInput(decodedMessage);
      
      // Submit after a short delay to ensure everything is initialized
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }, 300);
    }
  }, [props.initialMessage]);

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const memoizedMessages = useMemo(() => messages.map((message: ChatMessageModel) => (
    <ChatMessageArea
      key={message.id}
      profileName={message.name}
      role={message.role}
      onCopy={() => handleCopy(message.content)}
      profilePicture={
        message.role === "assistant"
          ? profilePicture
          : session?.user?.image
      }
      theme={theme}
    >
      <MessageContent message={message} />
    </ChatMessageArea>
  )), [messages, profilePicture, session?.user?.image, theme, handleCopy]);

  return (
    <main className="flex flex-1 relative flex-col h-screen overflow-hidden">
      <MemoizedChatHeader
        chatThread={props.chatThread}
        chatDocuments={props.chatDocuments}
        extensions={props.extensions}
      />
      
      <AnimatePresence mode="wait">
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-auto border-none"
            style={{ height: 'calc(100vh - 260px)' }}
          >
            <ChatMessageContainer ref={current} className={cn("bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/30 dark:to-slate-950")}>
              <ChatMessageContentArea>
                {memoizedMessages}
                {loading === "loading" && <ChatLoading />}
              </ChatMessageContentArea>
            </ChatMessageContainer>
          </motion.div>
      </AnimatePresence>
      
     
      
      {/* Footer with chat input below Line 2 */}
      <div className="py-4 bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center px-4 max-w-4xl mx-auto w-full">
          <div className="w-full backdrop-blur rounded-xl ">
            <ChatInput formRef={formRef} />
          </div>
          <div className="text-center text-sm text-muted-foreground mt-1">
            <Disclaimer text={"The information generated by COMAU AICO could be wrong, please verify before using it."} />
          </div>
        </div>
      </div>
    </main>
  );
};
