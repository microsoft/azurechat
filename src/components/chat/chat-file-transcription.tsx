import { DownloadIcon } from "lucide-react"
import { FC } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { convertTranscriptionToWordDocument } from "@/features/common/file-export"
import { AI_NAME } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { useWindowSize } from "@/features/ui/windowsize"

interface ChatFileTranscriptionProps {
  name: string
  contents: string
}

export const ChatFileTranscription: FC<ChatFileTranscriptionProps> = props => {
  const { chatBody } = useChatContext()

  const onDownloadTranscription = async (): Promise<void> => {
    const fileName = `${props.name}-transcription.docx`
    const chatThreadName = chatBody.chatThreadName || `${AI_NAME} ${fileName}`
    await convertTranscriptionToWordDocument([props.contents], props.name, fileName, AI_NAME, chatThreadName)
  }

  const { width } = useWindowSize()
  let iconSize = 10
  let buttonClass = "h-9"

  if (width < 768) {
    buttonClass = "h-7"
  } else if (width >= 768 && width < 1024) {
    iconSize = 12
  } else if (width >= 1024) {
    iconSize = 16
  }

  return (
    <article className="container mx-auto flex flex-col py-1 pb-4">
      <section className="flex-col gap-4 overflow-hidden rounded-md bg-background p-4">
        <header className="flex w-full items-center justify-between">
          <Typography variant="h3">{props.name}</Typography>
        </header>
        <div className="prose prose-slate max-w-none break-words text-base italic text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base">
          <Markdown content={props.contents.replaceAll("\n", "\n\n") || ""} />
        </div>
        <footer>
          <div className="container flex w-full gap-4 p-2">
            <Button
              ariaLabel="Download Transcription"
              variant={"ghost"}
              size={"default"}
              className={buttonClass}
              title="Download Transcription"
              onClick={onDownloadTranscription}
            >
              <DownloadIcon size={iconSize} />
            </Button>
          </div>
        </footer>
      </section>
    </article>
  )
}
