import { Loader, Send } from "lucide-react"
import { getSession } from "next-auth/react"
import { FC, FormEvent, useRef, useMemo } from "react"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatFileSlider } from "@/features/chat/chat-ui/chat-file/chat-file-slider"
import { convertMarkdownToWordDocument } from "@/features/common/file-export"
import { AI_NAME } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { Textarea } from "@/features/ui/textarea"

import ChatInputMenu from "./chat-input-menu"

interface Props {}

const ChatInput: FC<Props> = () => {
  const { setInput, handleSubmit, isLoading, input, chatBody, isModalOpen, messages, fileState } = useChatContext()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDataChat = useMemo(() => chatBody.chatType === "data" || chatBody.chatType === "audio", [chatBody.chatType])
  const fileChatVisible = (chatBody.chatType === "data" || chatBody.chatType === "audio") && chatBody.chatOverFileName

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Brisbane"
  const getNameInline = async (): Promise<string> => {
    const session = await getSession()
    const name = session?.user?.name || "You"
    return name
  }

  const getFormattedDateTime = (): string => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timeZone,
    }
    const formattedDate = new Intl.DateTimeFormat("en-AU", options).format(date)
    return formattedDate.split(",").join("_").split(" ").join("_").split(":").join("_")
  }

  const exportDocument = async (): Promise<void> => {
    const fileName = AI_NAME + ` Export_${getFormattedDateTime()}.docx`
    const userName = await getNameInline()
    const chatThreadName = chatBody.chatThreadName || AI_NAME + ` Export_${getFormattedDateTime()}.docx`
    await convertMarkdownToWordDocument(messages, fileName, AI_NAME, userName, chatThreadName)
  }

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!isModalOpen && !fileState.isUploadingFile) {
      handleSubmit(e)
      setInput("")
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(event.target.value)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey && !isModalOpen) {
      event.preventDefault()
      if (!isLoading && !fileState.isUploadingFile) {
        handleSubmit(event as unknown as FormEvent<HTMLFormElement>)
        setInput("")
      }
    }
  }

  if (isModalOpen) {
    return null
  }

  return (
    <form onSubmit={submit} className="absolute bottom-0 z-70 flex w-full items-center">
      <div className="container relative mx-auto flex items-center gap-2 py-2">
        <Textarea
          id="chatMessage"
          name="chatMessage"
          value={input}
          placeholder="Send a message, or use the right hand menu to export your chat to document, add another document or more."
          aria-label="Send a message"
          className="bg-background py-4 pr-[40px]"
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={4}
          disabled={isLoading || fileState.isUploadingFile}
        />
        <div className="absolute bottom-0 right-5 mb-4 mr-5 grid h-auto items-end">
          {!isDataChat || (isDataChat && fileChatVisible) ? (
            <>
              <Button
                size="icon"
                type="submit"
                variant="ghost"
                ref={buttonRef}
                disabled={isLoading}
                ariaLabel="Submit your message"
                aria-busy={isLoading ? "true" : "false"}
              >
                {isLoading || fileState.isUploadingFile ? (
                  <Loader className="animate-spin" aria-hidden="true" size={16} />
                ) : (
                  <Send aria-hidden="true" size={16} />
                )}
              </Button>
              {fileChatVisible && <ChatFileSlider />}
              {!isLoading && !fileState.isUploadingFile && (
                <ChatInputMenu onDocExport={exportDocument} messageCopy={messages} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </form>
  )
}

export default ChatInput
