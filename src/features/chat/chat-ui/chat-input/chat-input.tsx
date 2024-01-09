import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatContext } from "@/features/chat/chat-ui/chat-context";
import { useGlobalConfigContext } from "@/features/global-config/global-client-config-context";
import { Loader, Send, Bird } from "lucide-react";
import { FC, FormEvent, useRef, useState } from "react";
import { ChatFileSlider } from "../chat-file/chat-file-slider";
import { Microphone } from "../chat-speech/microphone";
import { useChatInputDynamicHeight } from "./use-chat-input-dynamic-height";
import { trackEventClientSide } from "@/features/common/app-insights";

interface Props {}

const ChatInput: FC<Props> = (props) => {
  const { setInput, handleSubmit, isLoading, input, chatBody } = useChatContext();

  const handleFAIRAClick = () => {
    setInput("Help me complete a Queensland Government Fast AI Risk Assessment (FAIRA)");

    trackEventClientSide('FAIRA_Button_Click', { input: "FAIRA Request" });

    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    }, 0);
  };

  const { speechEnabled } = useGlobalConfigContext();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { rows, resetRows, onKeyDown, onKeyUp } = useChatInputDynamicHeight({
    buttonRef,
  });

  const isDataChat = chatBody.chatType === "data";
  const fileChatVisible = chatBody.chatType === "data" && chatBody.chatOverFileName;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    resetRows();
    setInput("");
    trackEventClientSide('Input_Submit', { input: "Message Submitted" });
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  return (
    <form
      onSubmit={submit}
      className="absolute bottom-0 w-full flex items-center"
    >
      <div className="container mx-auto max-w-4xl relative py-2 flex gap-2 items-center">
        {fileChatVisible && <ChatFileSlider />}
        <Textarea
          rows={rows}
          value={input}
          placeholder="Send a message"
          className="min-h-fit bg-background shadow-sm resize-none py-4 pr-[80px]"
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onChange={onChange}
        />
        <div className="absolute right-0 bottom-0 px-8 flex items-end h-full mr-2 mb-4">
          {speechEnabled && <Microphone disabled={isLoading} />}
          {!isDataChat || (isDataChat && fileChatVisible) ? (
            <>
              <Button
                size="icon"
                type="submit"
                variant="ghost"
                ref={buttonRef}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
              </Button>
              {!isLoading && (
                <Button
                  onClick={handleFAIRAClick}
                  size="icon"
                  variant="ghost"
                  disabled={isLoading}
                >
                  <Bird size={16} />
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
