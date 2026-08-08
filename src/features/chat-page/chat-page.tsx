"use client";
import { ChatInput } from "@/features/chat-page/chat-input/chat-input";
import { chatStore, useChat } from "@/features/chat-page/chat-store";
import { ChatLoading } from "@/features/ui/chat/chat-message-area/chat-loading";
import { ChatMessageArea } from "@/features/ui/chat/chat-message-area/chat-message-area";
import ChatMessageContainer from "@/features/ui/chat/chat-message-area/chat-message-container";
import ChatMessageContentArea from "@/features/ui/chat/chat-message-area/chat-message-content";
import { useChatScrollAnchor } from "@/features/ui/chat/chat-message-area/use-chat-scroll-anchor";
import { useSession } from "next-auth/react";
import { FC, useEffect, useMemo, useRef } from "react";
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

  // Documents belong to the thread, not to a message, but the upload always
  // precedes the send. Walking both lists by timestamp assigns each document
  // to the turn it was attached for, and leaves anything uploaded since the
  // last turn as still-pending — which is what the composer shows.
  const { documentsByMessageId, pendingDocuments } = useMemo(() => {
    const ordered = [...props.chatDocuments].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const byMessage: Record<string, Array<ChatDocumentModel>> = {};
    let cursor = 0;

    for (const message of messages) {
      if (message.role !== "user") continue;
      const sentAt = new Date(message.createdAt).getTime();
      const attached: Array<ChatDocumentModel> = [];
      while (
        cursor < ordered.length &&
        new Date(ordered[cursor].createdAt).getTime() <= sentAt
      ) {
        attached.push(ordered[cursor]);
        cursor++;
      }
      if (attached.length > 0) byMessage[message.id] = attached;
    }

    return {
      documentsByMessageId: byMessage,
      pendingDocuments: ordered.slice(cursor),
    };
  }, [props.chatDocuments, messages]);

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
                documents={documentsByMessageId[message.id]}
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
      <ChatInput chatDocuments={pendingDocuments} />
    </main>
  );
};
