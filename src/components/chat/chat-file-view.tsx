import { BellRing } from "lucide-react"
import { FC, useState } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"

import { CopyButton } from "@/features/ui/assistant-buttons"

interface ChatFileProps {
  name: string
  contents: string
}

export const ChatFileView: FC<ChatFileProps> = props => {
  const [feedbackMessage, setFeedbackMessage] = useState("")

  return (
    <div>
      <div className="container mx-auto flex flex-col py-1 pb-4">
        <section className="flex flex-row items-center gap-4 overflow-hidden rounded-md bg-background p-4">
          <BellRing />
          <Typography variant="span" className="italic">
            Please remember the below represents the data extracted from the file uploaded and may not accurately
            replicate the original file information. This is provided as a reference only and is not an official record.
          </Typography>
          <BellRing />
        </section>
      </div>
      <article className="container mx-auto flex flex-col py-1 pb-4">
        <section className="flex-col gap-4 overflow-hidden rounded-md bg-background p-4">
          <header className="flex w-full items-center justify-between">
            <Typography variant="h3">File Name: {props.name}</Typography>
          </header>
          <div className="prose prose-slate max-w-none break-words text-base italic text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base">
            <Markdown content={props.contents.replaceAll("\n", "\n\n") || ""} />
          </div>
          <footer>
            <div className="container flex w-full gap-4 p-2">
              <CopyButton message={props.contents} onFeedbackChange={setFeedbackMessage} />
            </div>
          </footer>
          <div className="sr-only" aria-live="assertive">
            {feedbackMessage}
          </div>
        </section>
      </article>
    </div>
  )
}
