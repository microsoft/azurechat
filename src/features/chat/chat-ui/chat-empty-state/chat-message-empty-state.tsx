import { FC, FormEvent, useRef, useState } from "react";
import { useChatContext } from "../chat-context";
import { ChatFileUI } from "../chat-file/chat-file-ui";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatSensitivitySelector } from "./chat-sensitivity-selector";
import { ChatTypeSelector } from "./chat-type-selector";
import { PromptButton } from "./prompt-buttons-UI";
import { Card } from "@/components/ui/card";
import Typography from "@/components/typography";
import { CreateChatThread, UpsertPromptButton } from "../../chat-services/chat-thread-service";
import { EasterEgg } from "./chat-easter-egg";


interface Prop { }

export const ChatMessageEmptyState: FC<Prop> = (props) => {

  const { setInput, handleSubmit, isLoading, input, chatBody } = useChatContext();
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(undefined);

  async function callUpsertPromptButton(prompt: string) {
    const chatThreadModel = await CreateChatThread();
    if (chatThreadModel) {
      const id = chatThreadModel.chatThreadId;
      UpsertPromptButton(prompt, id);
    } else {
      console.log('Failed to create chat thread');
    }
  }

  const handlePromptSelected = (prompt: string) => {
    setSelectedPrompt(prompt);

    try {
      setInput(prompt);
      callUpsertPromptButton(prompt);
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };

  const { fileState } = useChatContext();
  const { showFileUpload } = fileState;

  return (
    <div className="grid grid-cols-5 w-full items-center container overflow-auto mx-auto max-w-3xl justify-center max:h-5/6 p-4 gap-9 pb-[80px]">
      <Card className="col-span-5 flex flex-col gap-2 p-5 ">
          <EasterEgg />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text">
            Set the Sensitivity of your chat
          </p>
          <ChatSensitivitySelector disable={false} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text">
            Choose a conversation style
          </p>
          <ChatStyleSelector disable={false} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text">
            How would you like to chat?
          </p>
          <ChatTypeSelector disable={false} />
        </div>
        {showFileUpload === "data" || showFileUpload === "audio" ? <ChatFileUI /> : (
          <div className="flex flex-col gap-1">
            <br />
            <p className="text-sm text-text">
              Try a suggested starter prompt...
            </p>
            <PromptButton onPromptSelected={handlePromptSelected} selectedPrompt={selectedPrompt} />
          </div>
        )}
      </Card>
    </div>
  );
};
