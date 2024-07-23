"use client"

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { FC, useCallback } from "react"
import { useFormState } from "react-dom"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { Button } from "@/features/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetDescription } from "@/features/ui/sheet"

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

  const handleButtonClick = useCallback((): void => {
    const formData = new FormData()
    formData.append("index", props.index.toString())
    formData.append("id", props.id)
    formData.append("userId", userId)
    formData.append("tenantId", tenantId)
    formData.append("chatThreadId", chatThreadId)
    formData.append("order", props.order.toString())
    formData.append("name", props.name)
    formAction(formData)
  }, [props.index, props.id, userId, tenantId, chatThreadId, props.order, props.name, formAction])

  return (
    <form>
      <input type="hidden" name="id" value={props.order} />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            ariaLabel={`Open citation number ${props.order}`}
            variant="outline"
            onClick={handleButtonClick}
            type="button"
            value={props.order}
          >
            {props.order}
          </Button>
        </SheetTrigger>
        <SheetContent aria-modal="true" role="dialog" aria-labelledby={undefined} aria-describedby={undefined}>
          <SheetTitle>Citation for Section {props.order}</SheetTitle>
          <VisuallyHidden.Root>
            <SheetDescription>Detailed information about citation number {props.order}.</SheetDescription>
          </VisuallyHidden.Root>
          {node}
        </SheetContent>
      </Sheet>
    </form>
  )
}
