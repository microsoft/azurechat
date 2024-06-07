"use client"

import * as Form from "@radix-ui/react-form"
import { useSession } from "next-auth/react"
import React, { useState, FormEvent } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"
import { CardSkeleton } from "@/features/ui/card-skeleton"
import { UserPreferences } from "@/features/user-management/models"

export const UserDetailsForm: React.FC<{ preferences: UserPreferences }> = ({ preferences }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [contextPrompt, setContextPrompt] = useState(preferences.contextPrompt)
  const { data: session } = useSession()

  const handleSubmitContextPrompt = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const newContextPrompt = new FormData(e.currentTarget).get("contextPrompt") as string
    await submit(newContextPrompt).then(() => (e.target as HTMLFormElement)?.reset())
  }

  async function submit(newContextPrompt: string): Promise<void> {
    setIsSubmitting(true)
    if (contextPrompt === newContextPrompt) {
      setIsSubmitting(false)
      return
    }
    const temp = contextPrompt
    setContextPrompt(newContextPrompt)
    const defaultErrorMessage = contextPrompt
      ? "Your context prompt could not be updated. Please try again later."
      : "Your context prompt could not be cleared. Please try again later."
    try {
      const response = await fetch("/api/user/details", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextPrompt: newContextPrompt }),
      })
      if (!response.ok) throw new Error(defaultErrorMessage)
      showSuccess({ title: "Success", description: "Context prompt updated successfully!" })
    } catch (error) {
      setContextPrompt(temp)
      setError(true)
      showError(defaultErrorMessage)
      logger.error("Error updating context prompt", { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Typography variant="h4" className="font-bold underline underline-offset-2">
        Your Details
      </Typography>
      <Typography variant="h5" className="mt-4">
        Name:
        <div className="mt-2 rounded-md bg-altBackgroundShade p-4">{session?.user?.name || <CardSkeleton />}</div>
      </Typography>
      <Typography variant="h5" className="mt-4">
        Email:
        <div className="mt-2 rounded-md bg-altBackgroundShade p-4">{session?.user?.email || <CardSkeleton />}</div>
      </Typography>
      <Typography variant="h5" className="mt-4">
        Current Prompt:
      </Typography>
      <div className="mt-4 rounded-md bg-altBackgroundShade p-4">
        <Markdown content={contextPrompt || "Not set"} />
      </div>
      <Form.Root onSubmit={handleSubmitContextPrompt} className="mt-4 flex flex-col gap-2">
        <Form.Field name="contextPrompt" serverInvalid={error}>
          <Form.Label htmlFor="contextPrompt" className="block">
            Set Context Prompt:
          </Form.Label>
          <Form.Control asChild>
            <textarea
              id="contextPrompt"
              name="contextPrompt"
              className="mt-4 w-full rounded-md border-2 p-2"
              placeholder="Enter new context prompt..."
              rows={8}
              maxLength={500}
              required
              aria-label="New context prompt"
            />
          </Form.Control>
          {error && (
            <Form.Message role="alert" className="my-2 text-alert">
              Error updating context prompt. Please try again.
            </Form.Message>
          )}
        </Form.Field>
        <div className="mb-4 flex gap-4">
          <Form.Submit asChild>
            <Button
              type="submit"
              className="w-[14rem]"
              variant="default"
              disabled={isSubmitting}
              ariaLabel="Update context prompt"
            >
              {isSubmitting ? "Updating..." : "Update Context Prompt"}
            </Button>
          </Form.Submit>
          <Button
            type="button"
            className="w-[14rem]"
            variant="destructive"
            onClick={async () => await submit("")}
            disabled={isSubmitting}
            ariaLabel="Clear context prompt"
          >
            {isSubmitting ? "Clearing..." : "Clear Context Prompt"}
          </Button>
        </div>
      </Form.Root>
    </>
  )
}
