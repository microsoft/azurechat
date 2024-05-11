import { FC } from "react"
import { useFormState } from "react-dom"

import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { AI_NAME } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/features/ui/sheet"

import { CitationAction } from "./citation-action"

interface SliderProps {
  name: string
  index: number
  id: string
  tenantId: string
  userId: string
  order: number
  chatThreadId: string
}

export const CitationSlider: FC<SliderProps> = props => {
  const chatContext = useChatContext()
  const { userId, tenantId } = chatContext.chatBody
  const chatThreadId = chatContext.id
  const [node, formAction] = useFormState(CitationAction, null)

  const handleButtonClick = (): void => {
    const formData = new FormData()
    formData.append("index", props.index.toString())
    formData.append("id", props.id)
    formData.append("userId", userId)
    formData.append("tenantId", tenantId)
    formData.append("chatThreadId", chatThreadId)
    formData.append("order", props.order.toString())
    formAction(formData)
  }

  return (
    <form>
      <input type="hidden" name="id" value={props.order} />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            ariaLabel={`Citation number ${props.order}`}
            variant="outline"
            onClick={handleButtonClick}
            type="button"
            value={props.order}
          >
            {props.order}
          </Button>
        </SheetTrigger>
        <SheetContent aria-modal="true" role="dialog" aria-labelledby={"Section" + props.order}>
          <SheetHeader>
            <SheetTitle id={"Section" + props.order}>Citation for Section {props.order}</SheetTitle>
          </SheetHeader>
          <Typography variant="p" className="">
            {node}
          </Typography>
          <Typography variant="h2" className="p-2">
            Understanding Citations
          </Typography>
          <Typography variant="p" className="p-2">
            The citation presented is a specific snippet from your document, selected by {AI_NAME} through
            Retrieval-Augmented Generation (RAG) for its relevance to your question. If the snippets seem unrelated, it
            might suggest that {AI_NAME} needs more context or clearer questions to accurately pinpoint the right
            information. This method aims to deliver focused and relevant insights, but sometimes it may need further
            clarification to match your question precisely.
          </Typography>
        </SheetContent>
      </Sheet>
    </form>
  )
}
