"use client"

import * as Form from "@radix-ui/react-form"
import { useSession } from "next-auth/react"
import React, { useState, FormEvent, useEffect } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError } from "@/features/globals/global-message-store"
import { showSuccess } from "@/features/globals/global-message-store"
import { Button } from "@/features/ui/button"
import { CardSkeleton } from "@/features/ui/card-skeleton"
import { UserPreferences } from "@/features/user-management/models"

interface PromptFormProps {}

export const UserDetailsForm: React.FC<PromptFormProps> = () => {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({ contextPrompt: false })
  const [contextPrompt, setContextPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) return
    async function fetchPreferences(): Promise<UserPreferences> {
      const res = await fetch("/api/user/details", { method: "GET" })
      return (await res.json()).data as UserPreferences
    }
    fetchPreferences()
      .then(res => setContextPrompt(res.contextPrompt))
      .catch(err => {
        console.error("Failed to fetch user preferences:", err)
        showError("User settings couldn't be loaded, please try again.")
      })
      .finally(() => setIsLoading(false))
  }, [session])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!session?.user) return
    const newContextPrompt = new FormData(e.currentTarget).get("contextPrompt") as string

    setIsSubmitting(true)
    setServerErrors({ contextPrompt: false })

    const temp = contextPrompt
    setContextPrompt(newContextPrompt)

    const response = await fetch("/api/user/details", {
      method: "POST",
      body: JSON.stringify({
        contextPrompt: newContextPrompt,
        upn: session.user.upn,
        tenantId: session.user.tenantId,
      }),
    })
    if (!response.ok) {
      showError("Context prompt could not be updated. Please try again later.")
      setContextPrompt(temp)
    } else {
      showSuccess({ title: "Success", description: "Context prompt updated successfully!" })
      ;(e.target as HTMLFormElement)?.reset()
    }

    setIsSubmitting(false)
  }

  return (
    <Form.Root className="size-full w-[500px] pt-5" onSubmit={handleSubmit}>
      <div className="mb-4">
        <Typography variant="h4" className="font-bold underline underline-offset-2">
          USER INFORMATION
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">
          Name:
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div>
              <b>{session?.user?.name}</b>
            </div>
          )}
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">
          Email:
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div>
              <b>{session?.user?.email}</b>
            </div>
          )}
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">Current Prompt:</Typography>
        <div className="mt-2 rounded-md border-2 p-2">
          {isLoading ? <CardSkeleton /> : <Markdown content={contextPrompt || "Not set"} />}
        </div>
      </div>
      <Form.Field className="mb-4" name="contextPrompt" serverInvalid={serverErrors.contextPrompt}>
        <Form.Label htmlFor="contextPrompt" className="block ">
          New Context Prompt:
        </Form.Label>
        <Form.Control asChild>
          <textarea
            id="contextPrompt"
            className="mt-2 w-full rounded-md border-2 p-2"
            placeholder="Enter new context prompt..."
            rows={6}
            maxLength={200}
            required
          />
        </Form.Control>
        {serverErrors.contextPrompt && (
          <Form.Message role="alert" className="mt-2 text-red-600">
            Error updating context prompt. Please try again.
          </Form.Message>
        )}
      </Form.Field>
      {!isLoading && (
        <Form.Submit asChild>
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </Form.Submit>
      )}
    </Form.Root>
  )
}
