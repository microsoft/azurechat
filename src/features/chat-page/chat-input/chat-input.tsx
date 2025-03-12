"use client";

import {
  ResetInputRows,
  onKeyDown,
  onKeyUp,
  useChatInputDynamicHeight,
} from "@/features/chat-page/chat-input/use-chat-input-dynamic-height";
import { AttachFile } from "@/features/ui/chat/chat-input-area/attach-file";
import {
  ChatInputActionArea,
  ChatInputForm,
  ChatInputPrimaryActionArea,
  ChatInputSecondaryActionArea,
} from "@/features/ui/chat/chat-input-area/chat-input-area";
import { ChatTextInput } from "@/features/ui/chat/chat-input-area/chat-text-input";
import { ImageInput } from "@/features/ui/chat/chat-input-area/image-input";
import { StopChat } from "@/features/ui/chat/chat-input-area/stop-chat";
import { SubmitChat } from "@/features/ui/chat/chat-input-area/submit-chat";
import React, { useRef } from "react";
import { chatStore, useChat } from "../chat-store";
import { fileStore, useFileStore } from "./file/file-store";
import { PromptSlider } from "./prompt/prompt-slider";
import {
  speechToTextStore,
  useSpeechToText,
} from "./speech/use-speech-to-text";
import {
  textToSpeechStore,
  useTextToSpeech,
} from "./speech/use-text-to-speech";
import { InputImageStore } from "@/features/ui/chat/chat-input-area/input-image-store";
import type { ChatDocumentModel } from "../chat-services/models";
import { Trash2, File } from "lucide-react";
import { Button } from "@/features/ui/button";
import { SoftDeleteChatDocumentsForCurrentUser } from "../chat-services/chat-thread-service";
import { RevalidateCache } from "@/features/common/navigation-helpers";
import { ExtensionModel } from "@/features/extensions-page/extension-services/models";
import { InternetSearch } from "@/features/ui/chat/chat-input-area/internet-search";

interface ChatInputProps {
  chatDocuments: ChatDocumentModel[];
  internetSearch?: ExtensionModel;
  threadExtensions?: string[];
}

export const ChatInput = ({
  chatDocuments,
  internetSearch,
  threadExtensions
}: ChatInputProps) => {
  const { loading, input, chatThreadId } = useChat();
  const { uploadButtonLabel } = useFileStore();
  const { isPlaying } = useTextToSpeech();
  const { isMicrophoneReady } = useSpeechToText();
  const { rows } = useChatInputDynamicHeight();

  const submitButton = React.useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handlePaste = async (event: any) => {
    const items = (event.clipboardData || event.nativeEvent.clipboardData)
      ?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        if (items[i].type.startsWith("image/")) {
          handlePastedImage(items[i]);
        } else {
          handlePastedFile(items[i]);
        }
      }
    }
  };

  const handlePastedImage = async (file: DataTransferItem) => {
    const blob = file.getAsFile();
    if (blob) {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        if (reader.result) {
          InputImageStore.UpdateBase64Image(reader.result as string);
        }
      };
    }
  };

  const handlePastedFile = async (file: DataTransferItem) => {
    const blob = file.getAsFile();
    if (blob) {
      const formData = new FormData();
      formData.append("file", blob);
      await fileStore.onFileChange({ formData, chatThreadId });
    }
  };

  const handleDocumentsDeletion = async () => {
    const threadId = chatDocuments[0].chatThreadId;
    await SoftDeleteChatDocumentsForCurrentUser(threadId);
    RevalidateCache({
      page: "chat",
      type: "layout",
    });
  };

  return (
    <ChatInputForm
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        chatStore.submitChat(e);
      }}
      status={uploadButtonLabel}
      onPaste={handlePaste}
    >
      {chatDocuments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 mb-2 rounded-md">
          {chatDocuments.map((doc, index) => (
            <div
              key={index}
              className="px-2 py-1 gap-2 rounded border bg-background hover:bg-accent hover:text-accent-foreground text-xs flex items-center h-7"
            >
              <File size={12}/>
              <span className="truncate max-w-[200px]">{doc.name}</span>
            </div>
          ))}
          <Button
            variant={"outline"}
            size={"icon"}
            className="h-7"
            onClick={handleDocumentsDeletion}
          >
            <Trash2 className="" size={12} />
          </Button>
        </div>
      )}

      <ChatTextInput
        onBlur={(e) => {
          if (e.currentTarget.value.replace(/\s/g, "").length === 0) {
            ResetInputRows();
          }
        }}
        onKeyDown={(e) => {
          onKeyDown(e, submit);
        }}
        onKeyUp={(e) => {
          onKeyUp(e);
        }}
        value={input}
        rows={rows}
        onChange={(e) => {
          chatStore.updateInput(e.currentTarget.value);
        }}
      />
      <ChatInputActionArea>
        <ChatInputSecondaryActionArea>
          {internetSearch && threadExtensions && <InternetSearch extension={internetSearch} threadExtensions={threadExtensions}/>}
          <AttachFile
            onClick={(formData) =>
              fileStore.onFileChange({ formData, chatThreadId })
            }
          />
          <PromptSlider />
        </ChatInputSecondaryActionArea>
        <ChatInputPrimaryActionArea>
          <ImageInput />
          {/* Does not work so we disable it for now */}
          {/* <Microphone
            startRecognition={() => speechToTextStore.startRecognition()}
            stopRecognition={() => speechToTextStore.stopRecognition()}
            isPlaying={isPlaying}
            stopPlaying={() => textToSpeechStore.stopPlaying()}
            isMicrophoneReady={isMicrophoneReady}
          /> */}
          {loading === "loading" ? (
            <StopChat stop={() => chatStore.stopGeneratingMessages()} />
          ) : (
            <SubmitChat ref={submitButton} />
          )}
        </ChatInputPrimaryActionArea>
      </ChatInputActionArea>
    </ChatInputForm>
  );
};
