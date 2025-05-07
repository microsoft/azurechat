"use client";
import React, { FC, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ChatInput } from "@/features/chat-page/chat-input/chat-input";
import { chatStore, useChat } from "@/features/chat-page/chat-store";
import { ChatLoading } from "@/features/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/features/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/features/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/features/ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "@/features/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { useSession } from "next-auth/react";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { ChatHeader } from "@/features/chat-page/chat-header/chat-header";
import {
  ChatDocumentModel,
  ChatMessageModel,
  ChatThreadModel,
} from "@/features/chat-page/chat-services/models";
import MessageContent from "@/features/chat-page/message-content";
import Disclaimer from "@/features/ui/chat/disclaimer";
import { useTheme } from "next-themes";
import { PersonaModel } from "@/features/persona-page/persona-services/models";
import { PersonaCard } from "@/features/persona-page/persona-card/persona-card";
import { ExtensionCard } from "@/features/extensions-page/extension-card/extension-card";
import { AI_DESCRIPTION, AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { ScrollArea } from "@/features/ui/scroll-area";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/features/ui/button";
import { Card, CardContent } from "@/features/ui/card";
import { cn } from "@/features/ui/lib";

interface UnifiedChatPageProps {
  messages: Array<ChatMessageModel>;
  chatThread?: ChatThreadModel;
  chatDocuments?: Array<ChatDocumentModel>;
  extensions: Array<ExtensionModel>;
  personas: Array<PersonaModel>;
}

const MemoizedChatHeader = React.memo(ChatHeader);

export const UnifiedChatPage: FC<UnifiedChatPageProps> = (props) => {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [profilePicture, setProfilePicture] = useState("/logo.png");
  const [isConversationActive, setIsConversationActive] = useState(false);
  
  useEffect(() => {
    // If we have messages or a chat thread, set the conversation as active
    if ((props.messages && props.messages.length > 0) || props.chatThread) {
      setIsConversationActive(true);
    }
    
    // Initialize chat session if we have a chat thread
    if (props.chatThread) {
      chatStore.initChatSession({
        chatThread: props.chatThread,
        messages: props.messages,
        userName: session?.user?.name!,
      });
    }

    setProfilePicture(theme === "dark" ? "/Logo-white.png" : "/logo.png");
  }, [props.chatThread, props.messages, session?.user?.name, theme]);

  const { messages, loading } = useChat();

  const current = useRef<HTMLDivElement>(null);

  useChatScrollAnchor({ ref: current });

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

  const startNewChat = () => {
    // Clear any existing chat messages
    chatStore.initChatSession({
      chatThread: {
        id: "",
        name: "New Chat",
        userId: "",
        createdAt: new Date(),
        lastMessageAt: new Date(),
        useName: session?.user?.name || "",
        isDeleted: false,
        bookmarked: false,
        personaMessage: "",
        personaMessageTitle: "",
        extension: [],
        type: "CHAT_THREAD",
      },
      messages: [],
      userName: session?.user?.name!,
    });
    setIsConversationActive(true);
  };

  const handleExtensionSelect = (extension: ExtensionModel) => {
    // Add the selected extension to the chat thread
    if (props.chatThread) {
      chatStore.AddExtensionToChatThread(extension.id);
    }
    setIsConversationActive(true);
  };

  const handlePersonaSelect = (persona: PersonaModel) => {
    // Start a new chat with the selected persona
    // This would typically set a persona ID in the chat thread
    setIsConversationActive(true);
  };

  return (
    <main className="flex flex-1 relative flex-col">
      <AnimatePresence>
        {!isConversationActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <ScrollArea className="flex-1">
              <div className="flex flex-1 flex-col gap-8 pb-6">
                <Hero
                  title={
                    <>
                      <div className="flex items-center gap-3 text-primary">
                        <Image
                          src={"/ai-icon.png"}
                          width={60}
                          height={60}
                          quality={100}
                          alt="ai-icon"
                          className="rounded-lg shadow-lg"
                        />{" "}
                        <span className="text-3xl font-bold">{AI_NAME}</span>
                      </div>
                    </>
                  }
                  description={AI_DESCRIPTION}
                >
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={startNewChat}
                      className="transform transition-transform duration-200 hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md flex items-center gap-2 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-square">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Start New Conversation
                    </Button>
                  </div>
                </Hero>
                <div className="container max-w-6xl flex gap-12 flex-col">
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="text-2xl font-bold">Extensions</h2>
                      <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
                    </div>

                    {props.extensions && props.extensions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {props.extensions.map((extension) => {
                          return (
                            <motion.div 
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleExtensionSelect(extension)}
                              className="cursor-pointer rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-xl"
                              key={extension.id}
                            >
                              <Card className="h-full border-0">
                                <CardContent className="p-0">
                                  <ExtensionCard
                                    extension={extension}
                                    showContextMenu={false}
                                  />
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground max-w-xl">No extensions created</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="text-2xl font-bold">Personas</h2>
                      <div className="h-1 w-20 bg-purple-500 rounded-full"></div>
                    </div>

                    {props.personas && props.personas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {props.personas.map((persona) => {
                          return (
                            <motion.div 
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handlePersonaSelect(persona)}
                              className="cursor-pointer rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-xl"
                              key={persona.id}
                            >
                              <Card className="h-full border-0">
                                <CardContent className="p-0">
                                  <PersonaCard
                                    persona={persona}
                                    showContextMenu={false}
                                  />
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground max-w-xl">No personas created</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {isConversationActive && props.chatThread && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-4 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/80 z-10 border-b"
        >
          <MemoizedChatHeader
            chatThread={props.chatThread}
            chatDocuments={props.chatDocuments || []}
            extensions={props.extensions}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {isConversationActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-hidden rounded-lg bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-inner"
          >
            <ChatMessageContainer ref={current}>
              <ChatMessageContentArea>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-center max-w-md p-6 rounded-xl bg-white dark:bg-slate-800 shadow-lg"
                    >
                      <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                      <p className="text-muted-foreground text-sm">
                        Type a message below to start chatting with COMAU AICO
                      </p>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    {memoizedMessages}
                    {loading === "loading" && <ChatLoading />}
                  </>
                )}
              </ChatMessageContentArea>
            </ChatMessageContainer>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="flex flex-col items-center mt-4 px-4 max-w-4xl mx-auto w-full">
        <ChatInput />
        <div className="mt-2 text-center w-full">
          <Disclaimer text={"The information generated by COMAU AICO could be wrong, please verify before using it."} />
        </div>
      </div>
    </main>
  );
};
