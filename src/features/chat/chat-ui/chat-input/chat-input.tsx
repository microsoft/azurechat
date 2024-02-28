import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatContext } from "@/features/chat/chat-ui/chat-context";
import { Loader, Send } from "lucide-react";
import { FC, FormEvent, useRef, useMemo } from "react";
import { AI_NAME } from "@/features/theme/customise";
import { ChatFileSlider } from "../chat-file/chat-file-slider";
import { convertMarkdownToWordDocument } from "@/features/common/file-export";
import ChatInputMenu from "./chat-input-menu";

interface Props {}

const ChatInput: FC<Props> = () => {
  const { setInput, handleSubmit, isLoading, input, chatBody, isModalOpen, messages } = useChatContext();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDataChat = useMemo(() => (chatBody.chatType === "data" || chatBody.chatType === "audio"), [chatBody.chatType]);
  const fileChatVisible = useMemo(() => (chatBody.chatType === "data" || chatBody.chatType === "audio") && chatBody.chatOverFileName, [chatBody.chatType, chatBody.chatOverFileName]);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Brisbane";
  
  const getFormattedDateTime = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: timeZone };
    const formattedDate = new Intl.DateTimeFormat('en-AU', options).format(date);
    return formattedDate.split(',').join('_').split(' ').join('_').split(':').join('_');
  };

  const exportDocument = async () => {
    const fileName = `QChatExport_${getFormattedDateTime()}.docx`;
    const userId = chatBody.userId;
    const tenantId = chatBody.tenantId;
    const chatThreadId = chatBody.id;
    convertMarkdownToWordDocument(messages, fileName, AI_NAME, userId, tenantId, chatThreadId);
  };
  
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isModalOpen) {
      handleSubmit(e);
      setInput("");
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isModalOpen) {
      event.preventDefault(); 
      if (!isLoading) { // Ensure we don't attempt to submit when data is loading or in an improper state.
        handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
        setInput("");
      }
    }
  };

  if (isModalOpen) {
    return null;
  }

  return (
    <form onSubmit={submit} className="absolute bottom-0 w-full flex items-center">
      <div className="container mx-auto max-w-4xl relative py-2 flex gap-2 items-center">
        {fileChatVisible && <ChatFileSlider />}
        <Textarea
          id="chatMessage"
          name="chatMessage"
          value={input}
          placeholder="Send a message"
          aria-label="Send a message"
          className="md:rows-4 rows-2 min-h-fit bg-background shadow-sm resize-none py-4 pr-[80px]"
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <div className="absolute right-0 bottom-0 px-8 flex items-end h-full mr-2 mb-4">
          {!isDataChat || (isDataChat && fileChatVisible) ? (
            <>
              <Button
                size="icon"
                type="submit"
                variant="ghost"
                ref={buttonRef}
                disabled={isLoading}
                aria-label="Submit your message"
                aria-busy={isLoading ? "true" : "false"}
              >
                {isLoading ? <Loader className="animate-spin" aria-hidden="true" size={16} /> : <Send aria-hidden="true" size={16} />}
              </Button>
              {!isLoading && (
                <ChatInputMenu 
                  onDocExport={exportDocument}
                  handleSubmit={handleSubmit}
                  setInput={setInput}
                  messageCopy={messages}
                />              
              )}
            </>
          ) : null}
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
