import * as Label from "@radix-ui/react-label"
import React, { useState, useCallback } from "react"

import Typography from "@/components/typography"
import { AssociateReferenceWithChatThread } from "@/features/chat/chat-services/chat-thread-service"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"
const defaultPreferences = {
  contextPrompt: "",
  customReferenceFields: [
    {
      name: "internalReference",
      pattern: /^[a-zA-Z0-9]*$/,
      label: "Internal Reference ID",
    },
  ],
}
export const TranscriptForm = (): JSX.Element => {
  const { id, chatBody, setChatBody, tenantPreferences } = useChatContext()
  const [submitting, setSubmitting] = useState(false)
  const [isIdSaved, setIsIdSaved] = useState(false)
  const [message, setMessage] = useState("")
  const [referenceId, setReferenceId] = useState<string>(chatBody.internalReference || "")
  const preferences = tenantPreferences || defaultPreferences

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()
      setSubmitting(true)
      setMessage("")

      try {
        setChatBody({ ...chatBody, internalReference: referenceId })
        await AssociateReferenceWithChatThread(id, referenceId)
        setMessage(`Reference ID ${referenceId} saved.`)
        setIsIdSaved(true)
      } catch (_error) {
        setMessage("Failed to save reference ID.")
        logger.warning("Failed to save reference ID." + id + referenceId)
        setIsIdSaved(false)
      } finally {
        setSubmitting(false)
      }
    },
    [chatBody, id, referenceId, setChatBody]
  )

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceId(event.target.value)
  }, [])

  const customRef =
    preferences.customReferenceFields?.find(c => c.name === "internalReference") ||
    defaultPreferences.customReferenceFields?.[0]
  return (
    <div className="bg-background p-5">
      {isIdSaved ? (
        <Typography variant="p" className="text-muted-foreground">
          Internal Reference ID {referenceId} saved.
        </Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex grid-cols-3 flex-wrap items-center gap-[15px]">
            <Label.Root htmlFor="internalReference" className="leading-[35px] text-muted-foreground">
              {customRef.label} :
            </Label.Root>
            <input
              className="bg-inputBackground shadow-blackA6 inline-flex h-[35px] w-[200px] appearance-none items-center justify-center rounded-[4px] px-[10px] leading-none text-muted-foreground shadow-[0_0_0_1px] outline-none selection:bg-accent selection:text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              type="text"
              id="internalReference"
              name="internalReference"
              placeholder="Please enter a valid id"
              pattern={customRef.pattern.source}
              title={customRef.label}
              required
              autoComplete="off"
              value={referenceId}
              onChange={handleChange}
            />
            <Button variant="default" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
          {message && (
            <div aria-live="polite" className="text-muted-foreground">
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  )
}
