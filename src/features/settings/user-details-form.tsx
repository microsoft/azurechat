"use client"

import * as Form from "@radix-ui/react-form"
import { useSession } from "next-auth/react"
import React, { useState, FormEvent, useEffect } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
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

  const contextMarkdown = `#### Provide Context for Tailored Interactions

To enhance the relevance of our interactions, sharing a brief note about your role and your preferred communication style can be very helpful. This information enables us to adjust our responses to better align with your needs and preferences. Consider including:

1. **Brief Role Description**: Just a line or two about what you do, without needing detailed personal or professional information.
2. **Preferred Communication Style**: Let us know if you favour detailed analyses, concise summaries, or a mixture of both.
3. **Other Preferences**: Mention any particular preferences or requirements that might influence how we should interact, such as clarity or the level of detail needed.

This approach helps us interact with you in the most effective and considerate manner.

#### Examples:

**Example 1:**
- **Brief Role Description**: I'm a software developer working mainly on mobile applications.
- **Preferred Communication Style**: I appreciate detailed, technical explanations that help me integrate concepts into my projects.
- **Other Preferences**: Efficiency is crucial due to my tight deadlines.

**Example 2:**
- **Brief Role Description**: I teach technology integration methods at a high school.
- **Preferred Communication Style**: I prefer straightforward, brief responses that I can easily understand and teach.
- **Other Preferences**: Please use simple language, as English is not my first language.`

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
    const formData = new FormData(e.currentTarget)
    const rawContextPrompt = formData.get("contextPrompt") as string
    const newContextPrompt = rawContextPrompt.trim() // Trim whitespace from the input

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
    <Form.Root className="grid size-full min-w-[400px] grid-cols-1 gap-8 pt-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <div className="mb-4 md:col-span-1">
        <Typography variant="h4" className="pt-4 font-bold text-siteTitle">
          Your Details
        </Typography>
        <div className="m-2">
          <Typography variant="h5" className="flex items-center">
            Name:
            {isLoading && (
              <div className="ml-2">
                <CardSkeleton />
              </div>
            )}
            {!isLoading && <span className="ml-2">{session?.user?.name}</span>}
          </Typography>
        </div>
        <div className="m-2">
          <Typography variant="h5" className="flex items-center">
            Name:
            {isLoading && (
              <div className="ml-2">
                <CardSkeleton />
              </div>
            )}
            {!isLoading && <span className="ml-2">{session?.user?.email}</span>}
          </Typography>
        </div>
        <div className="mb-4">
          <Typography variant="h5">Your current prompt:</Typography>
          <div className="mt-2 rounded-md border-2 p-2">
            {isLoading ? <CardSkeleton /> : <Markdown content={contextPrompt || "Not set"} />}
          </div>
        </div>
        <Form.Field className="mb-4" name="contextPrompt" serverInvalid={serverErrors.contextPrompt}>
          <Form.Label htmlFor="contextPrompt" className="block pb-2">
            Set a new prompt:
          </Form.Label>
          <Form.Control asChild>
            <textarea
              id="contextPrompt"
              className="border-1 w-full rounded-md p-2"
              placeholder="Enter new context prompt..."
              rows={6}
              maxLength={250}
              required
            />
          </Form.Control>
          {serverErrors.contextPrompt && (
            <Form.Message role="alert" className="text-QLD-error mt-2">
              Error updating context prompt. Please try again.
            </Form.Message>
          )}
        </Form.Field>

        {!isLoading && (
          <div className="flex justify-end">
            <Form.Submit asChild>
              <Button type="submit" variant="default" disabled={isSubmitting} className="mr-2">
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </Form.Submit>
            {/* <Button onClick={async e => handleSubmit(e, true)} variant="destructive" disabled={isSubmitting}>
              Remove Current Prompt
            </Button> */}
          </div>
        )}
      </div>
      <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:col-span-1">
        <Markdown content={contextMarkdown} />
      </div>
    </Form.Root>
  )
}
