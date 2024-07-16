import { ArrowUpCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, useEffect, useRef, useCallback } from "react"

import { APP_NAME } from "@/app-global"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { TranscriptForm } from "@/features/chat/chat-ui/chat-empty-state/chat-transcript-details"
import { Button } from "@/features/ui/button"
import { Input } from "@/features/ui/input"

import { ChatFilesDisplay } from "./chat-file-list"
import { useFileSelection } from "./use-file-selection"

export const ChatFileUI: FC = () => {
  const { id, fileState, chatBody } = useChatContext()
  const { isFileNull, setIsFileNull, uploadButtonLabel, isUploadingFile } = fileState
  const { onSubmit: uploadFile } = useFileSelection({ id })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const files = chatBody.chatOverFileName.split(", ")

  const getAcceptedFileType = useCallback((chatType: string): string => {
    switch (chatType) {
      case "data":
        return ".pdf"
      case "audio":
        return "audio/*, video/*"
      default:
        return ""
    }
  }, [])

  const acceptedFileType = getAcceptedFileType(chatBody.chatType)

  useEffect(() => {
    if (isFileNull && fileInputRef.current) {
      fileInputRef.current.value = fileInputRef.current.defaultValue
    }
  }, [isFileNull])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files
      if (files) {
        setIsFileNull(files.length === 0)
      }
    },
    [setIsFileNull]
  )

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      await uploadFile(e)
      router.refresh()
    },
    [uploadFile, router]
  )
  return (
    <div className="flex flex-col gap-2">
      {chatBody.chatType === "audio" && !chatBody.internalReference && <TranscriptForm />}
      {chatBody.internalReference && (
        <div className="mt-4">
          <Typography variant="p" className="text-muted-foreground">
            Reference ID: {chatBody.internalReference}
          </Typography>
        </div>
      )}
      <Typography variant="span" id="file-upload-description" className="text-muted-foreground">
        {`From June 28 the way you chat with files in ${APP_NAME} is changing, please note that content from uploaded files will only be available for a guaranteed seven days while we transition.`}
      </Typography>
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
          disabled={isUploadingFile && chatBody.chatType === "audio" && !chatBody.internalReference}
          accept={acceptedFileType}
          data-file-types={acceptedFileType}
          data-max-size="10"
          data-max-files="3"
          multiple
          label="Upload File"
          aria-describedby="file-upload-description"
          onChange={handleFileChange}
          className="file-input-class"
        />
        <Button
          type="submit"
          disabled={
            !(!isFileNull && !isUploadingFile) || (chatBody.chatType === "audio" && !chatBody.internalReference)
          }
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
      {chatBody.chatOverFileName.length !== 0 && <ChatFilesDisplay files={files} />}
      <Typography variant="span" id="file-upload-description" className="text-muted-foreground">
        {uploadButtonLabel ||
          "Select a file to upload, please note files are not stored in their original format and may be cleared from the system after thirty days. You can upload up to 3 pdf files, each not exceeding 10mb in size."}
      </Typography>
    </div>
  )
}

export default ChatFileUI
