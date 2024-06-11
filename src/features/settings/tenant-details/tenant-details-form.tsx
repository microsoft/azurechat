"use client"

import * as Form from "@radix-ui/react-form"
import React, { useState, FormEvent } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { TenantDetails } from "@/features/tenant-management/models"
import SystemPrompt from "@/features/theme/readable-systemprompt"
import { Button } from "@/features/ui/button"

export const TenantDetailsForm: React.FC<{ tenant: TenantDetails }> = ({ tenant }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [contextPrompt, setContextPrompt] = useState(tenant.preferences.contextPrompt)

  const handleSubmitContextPrompt = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const newContextPrompt = form.get("contextPrompt") as string
    try {
      await submit(newContextPrompt)
      ;(e.target as HTMLFormElement)?.reset()
    } catch (error) {
      logger.error("Error submitting context prompt", { error })
    }
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
      ? "Context prompt could not be updated. Please try again later."
      : "Context prompt could not be cleared. Please try again later."
    try {
      const response = await fetch("/api/tenant/details", {
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
        Department Information
      </Typography>
      <Typography variant="h5" className="mt-4">
        <strong>Notice:</strong> Updating the context prompt here will append the message to the global system message.
        This setting is regularly audited by the Queensland Government AI Unit.
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
            New Context Prompt:
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
      <Typography variant="h5" className="my-2">
        Current System Prompt:
      </Typography>
      <SystemPrompt />
    </>
  )
}
