import Typography from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpCircle, Loader2 } from "lucide-react";
import { FC } from "react";
import { useChatContext } from "./chat-context";
import { useFileSelection } from "./chat-file/use-file-selection";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatTypeSelector } from "./chat-type-selector";

interface Prop {}

export const ChatMessageEmptyState: FC<Prop> = (props) => {
  const { id, fileState, chatBody } = useChatContext();

  const {
    showFileUpload,
    isFileNull,
    setIsFileNull,
    uploadButtonLabel,
    isUploadingFile,
  } = fileState;

  const { onSubmit } = useFileSelection({ id });

  return (
    <div className="grid grid-cols-5 w-full items-center container mx-auto max-w-3xl justify-center h-full gap-9">
      <div className="col-span-2 gap-5 flex flex-col flex-1">
        <img src="/ai-icon.png" className="w-36" />
        <p className="">
          Start by just typing your message in the box below. You can also
          personalise the chat by making changes to the settings on the right.
        </p>
      </div>
      <Card className="col-span-3 flex flex-col gap-5 p-5 ">
        <Typography variant="h4" className="text-primary">
          Personalise
        </Typography>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Choose a conversation style
          </p>
          <ChatStyleSelector disable={false} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            How would you like to chat?
          </p>
          <ChatTypeSelector disable={false} />
        </div>
        {showFileUpload === "data" && (
          <div className="flex flex-col gap-2">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                name="file"
                type="file"
                required
                disabled={isUploadingFile}
                placeholder="Describe the purpose of the document"
                onChange={(e) => {
                  setIsFileNull(e.currentTarget.value === null);
                }}
              />

              <Button
                type="submit"
                value="Upload"
                disabled={!(!isFileNull && !isUploadingFile)}
                className="flex items-center gap-1"
              >
                {isUploadingFile ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ArrowUpCircle size={20} />
                )}
                Upload
              </Button>
            </form>
            <p className="text-xs text-primary">{uploadButtonLabel}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
