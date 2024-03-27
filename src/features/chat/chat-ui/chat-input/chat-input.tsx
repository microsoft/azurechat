import { Button } from "@/features/ui/button"
import { Textarea } from "@/features/ui/textarea"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { Loader, Send } from "lucide-react"
import { FC, FormEvent, useRef, useMemo } from "react"
import { AI_NAME } from "@/features/theme/theme-config"
import { ChatFileSlider } from "../chat-file/chat-file-slider"
import { convertMarkdownToWordDocument } from "@/features/common/file-export"
import ChatInputMenu from "./chat-input-menu"
import { getSession } from "next-auth/react"

interface Props {}

const ChatInput: FC<Props> = () => {
  const { setInput, handleSubmit, isLoading, input, chatBody, isModalOpen, messages } = useChatContext()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDataChat = useMemo(() => chatBody.chatType === "data" || chatBody.chatType === "audio", [chatBody.chatType])
  const fileChatVisible = useMemo(
    () => (chatBody.chatType === "data" || chatBody.chatType === "audio") && chatBody.chatOverFileName,
    [chatBody.chatType, chatBody.chatOverFileName]
  )
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
    if (!isModalOpen) {
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
      if (!isLoading) {
        handleSubmit(event as unknown as FormEvent<HTMLFormElement>)
        setInput("")
      }
    }
  }

  if (isModalOpen) {
    return null
  }

  return (
    <form onSubmit={submit} className="absolute bottom-0 flex w-full items-center">
      <div className="container relative mx-auto flex max-w-4xl items-center gap-2 py-2">
        {fileChatVisible && <ChatFileSlider />}
        <Textarea
          id="chatMessage"
          name="chatMessage"
          value={input}
          placeholder="Send a message"
          aria-label="Send a message"
          className="md:rows-4 rows-2 min-h-fit resize-none bg-background py-4 pr-[80px] shadow-sm"
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <div className="absolute bottom-0 right-0 mb-4 mr-2 flex h-full items-end px-8">
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
                {isLoading ? (
                  <Loader className="animate-spin" aria-hidden="true" size={16} />
                ) : (
                  <Send aria-hidden="true" size={16} />
                )}
              </Button>
              {!isLoading && <ChatInputMenu onDocExport={exportDocument} messageCopy={messages} />}
            </>
          ) : null}
        </div>
      </div>
    </form>
  )
}

export default ChatInput
