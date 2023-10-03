import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpCircle, Loader2 } from "lucide-react";
import { FC } from "react";
import { useChatContext } from "../chat-context";
import { useFileSelection } from "./use-file-selection";

export const ChatFileUI: FC = () => {
  const { id, fileState } = useChatContext();

  const { isFileNull, setIsFileNull, uploadButtonLabel, isUploadingFile } =
    fileState;

  const { onSubmit } = useFileSelection({ id });

  return (
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
  );
};
