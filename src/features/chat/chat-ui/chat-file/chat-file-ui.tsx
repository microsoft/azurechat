import { ArrowUpCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, useEffect, useRef } from "react"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { OffenderTranscriptForm } from "@/features/chat/chat-ui/chat-empty-state/chat-transcript-details"
import { Button } from "@/features/ui/button"
import { Input } from "@/features/ui/input"

import { ChatFilesDisplay } from "./chat-file-list"
import { useFileSelection } from "./use-file-selection"

export const ChatFileUI: FC = () => {
  const { id, fileState, chatBody, offenderId } = useChatContext()
  const { isFileNull, setIsFileNull, uploadButtonLabel, isUploadingFile } = fileState
  const { onSubmit: uploadFile } = useFileSelection({ id })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const files = chatBody.chatOverFileName.split(", ")

  const getAcceptedFileType = (chatType: string): string => {
    switch (chatType) {
      case "data":
        return ".pdf"
      case "audio":
        return ".wav"
      default:
        return ""
    }
  }

  const acceptedFileType = getAcceptedFileType(chatBody.chatType)

  useEffect(() => {
    if (isFileNull && fileInputRef.current) {
      fileInputRef.current.value = fileInputRef.current.defaultValue
    }
  }, [isFileNull])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    await uploadFile(e)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <label htmlFor="file-upload" className="sr-only">
          Upload File
        </label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          name={chatBody.chatType}
          type="file"
          required
          disabled={isUploadingFile}
          accept={acceptedFileType}
          data-file-types={acceptedFileType}
          data-max-size="10"
          data-max-files="3"
          multiple={true}
          label="Upload File"
          aria-describedby="file-upload-description"
          onChange={e => {
            const files = e.currentTarget.files
            if (files) {
              setIsFileNull(files.length === 0)
            }
          }}
          className="file-input-class"
        />
        <Button
          type="submit"
          disabled={!(!isFileNull && !isUploadingFile)}
          className="flex items-center gap-1"
          aria-disabled={isUploadingFile ? "true" : undefined}
        >
          {isUploadingFile ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" size={20} />
              <Typography variant="span">Uploading...</Typography>
            </>
          ) : (
            <>
              <ArrowUpCircle aria-hidden="true" size={20} />
              Upload
            </>
          )}
        </Button>
      </form>
      {chatBody.chatOverFileName.length != 0 && <ChatFilesDisplay files={files} />}
      <Typography variant="span" id="file-upload-description" className="text-muted-foreground">
        {uploadButtonLabel ||
          "Select a file to upload, please note files are not stored in their original format and may be cleared from the system after thirty days. You can upload up to 3 pdf files, each not exceeding 10mb in size."}
      </Typography>
      {chatBody.chatType === "audio" && offenderId != null && (
        <div>
          <OffenderTranscriptForm chatThreadId={id} />
        </div>
      )}
    </div>
  )
}
