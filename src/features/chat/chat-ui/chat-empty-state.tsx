import Typography from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpCircle, Loader2 } from "lucide-react";
import { FC, useState } from "react";
import { ChatType, ConversationStyle, ChatLength, ChatPersona } from "../chat-services/models";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";
import { ChatLengthSelector } from "./chat-length-selector";
import { ChatPersonaSelector } from "./chat-persona-selector";

interface Prop {
  isUploadingFile: boolean;
  chatType: ChatType;
  conversationStyle: ConversationStyle;
  chatLength: ChatLength;
  chatPersona: ChatPersona;
  uploadButtonLabel: string;
  onChatTypeChange: (value: ChatType) => void;
  onConversationStyleChange: (value: ConversationStyle) => void;
  onChatLengthChange: (value: ChatLength) => void;
  onChatPersonaChange: (value: ChatPersona) => void;
  onFileChange: (file: FormData) => void;
}

export const EmptyState: FC<Prop> = (props) => {
  const [showFileUpload, setShowFileUpload] = useState<ChatType>("simple");
  const [isFileNull, setIsFileNull] = useState(true);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    props.onFileChange(formData);
  };

  const onChatTypeChange = (value: ChatType) => {
    setShowFileUpload(value);
    setIsFileNull(true);
    props.onChatTypeChange(value);
  };

  return (
    <div className="grid grid-cols-10 w-full items-center container mx-auto max-w-3xl justify-center h-full gap-9">
      <div className="col-span-4 gap-5 flex flex-col flex-1">
        <img src="/ai-icon.png" className="w-36" />
        <p className="">
          Start by just typing your message in the box below. You can also
          personalise the chat by making changes to the settings on the right.
        </p>
      </div>
      <Card className="col-span-6 flex flex-col gap-5 p-5 ">
        <Typography variant="h4" className="text-primary">
          Personalise
        </Typography>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Choose a conversation style
          </p>
          <ChatStyleSelector
            conversationStyle={props.conversationStyle}
            onChatStyleChange={props.onConversationStyleChange}
            disable={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            How long should the replies be?
          </p>
          <ChatLengthSelector
            chatlength={props.chatLength}
            onChatLengthChange={props.onChatLengthChange}
            disable={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Which personas should the bot imitate?
          </p>
          <ChatPersonaSelector
            chatPersona={props.chatPersona}
            onChatPersonaChange={props.onChatPersonaChange}
            disable={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            How would you like to chat?
          </p>
          <ChatTypeSelector
            chatType={props.chatType}
            onChatTypeChange={onChatTypeChange}
            disable={false}
          />
        </div>
        {showFileUpload === "data" && (
          <div className="flex flex-col gap-2">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                name="file"
                type="file"
                required
                disabled={props.isUploadingFile}
                placeholder="Describe the purpose of the document"
                onChange={(e) => {
                  setIsFileNull(e.currentTarget.value === null);
                }}
              />

              <Button
                type="submit"
                value="Upload"
                disabled={!(!isFileNull && !props.isUploadingFile)}
                className="flex items-center gap-1"
              >
                {props.isUploadingFile ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ArrowUpCircle size={20} />
                )}
                Upload
              </Button>
            </form>
            <p className="text-xs text-primary">{props.uploadButtonLabel}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
