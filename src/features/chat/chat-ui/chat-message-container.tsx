import ChatLoading from "@/components/chat/chat-loading";
import ChatRow from "@/components/chat/chat-row";
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor";
import { AI_NAME } from "@/features/theme/customise";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { useChatContext } from "./chat-context";
import { ChatHeader } from "./chat-header";
import { ChatRole } from "../chat-services/models";

interface Props {
  chatId: string;
  sentiment?: string;
  threadId: string;
  contentSafetyWarning?: string;
};

export const ChatMessageContainer: React.FC<Props> = ({ chatId, threadId, sentiment, contentSafetyWarning }) => {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading } = useChatContext();

  useChatScrollAnchor(messages, scrollRef);

  return (
    <div className="h-full overflow-y-auto bg-altBackground" ref={scrollRef}>
      <div className="flex justify-center p-4">
        <ChatHeader />
      </div>
      <div className=" pb-[80px] flex flex-col justify-end flex-1">
        {messages.map((message, index) => (
          <ChatRow
            chatMessageId={message.id}
            name={message.role === ChatRole.User ? session?.user?.name! : AI_NAME}
            profilePicture={
              message.role === ChatRole.User ? session?.user?.image! : ""
            }
            message={message.content}
            type={message.role as ChatRole}
            key={index}
            chatThreads={threadId}
            contentSafetyWarning={contentSafetyWarning}
          />
        ))}
        {isLoading && <ChatLoading />}
      </div>
    </div>
  );
};
