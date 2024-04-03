"use client"

import * as Form from "@radix-ui/react-form"
import { useSession } from "next-auth/react"
import React, { useState, useEffect } from "react"

interface PromptFormProps {}

export const PromptForm: React.FC<PromptFormProps> = () => {
  const { data: session } = useSession()
  const [contextPrompt, setContextPrompt] = useState("")
  const [serverErrors, setServerErrors] = useState({
    contextPrompt: false,
  })

  useEffect(() => {
    if (session?.user?.contextPrompt) {
      setContextPrompt(session.user.contextPrompt)
    }
  }, [session])

  const handleSubmit = async (formData: FormData): Promise<void> => {
    if (!session?.user) {
      console.error("No session data available")
      return
    }

    const values = Object.fromEntries(formData) as { contextPrompt: string }

    const endpoint = "/api/cosmos"
    const payload = {
      upn: session.user.upn,
      tenantId: session.user.tenantId,
      contextPrompt: values.contextPrompt,
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to update user data.")
      }
      setServerErrors({ contextPrompt: false })
    } catch (error) {
      console.error("Failed to submit the form:", error)
      setServerErrors({ contextPrompt: true })
    }
  }

  return (
    <Form.Root
      className="w-full"
      onSubmit={e => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        void handleSubmit(formData)
      }}
    >
      <div className="mb-[10px]">
        <div className="block text-sm font-medium text-foreground">Name</div>
        <div className="mt-1 w-full rounded-md border-altBackground bg-background p-2 shadow-sm">
          {session?.user?.name || "Not Specified"}
        </div>
      </div>
      <p>
        UserId: {session?.user?.userId}, Tenant: {session?.user?.tenantId}
      </p>
      <div className="mb-[10px]">
        <div className="block text-sm font-medium text-foreground">Email</div>
        <div className="mt-1 w-full rounded-md border-altBackground bg-background p-2 shadow-sm">
          {session?.user?.email || "Not Specified"}
        </div>
      </div>
      <Form.Field className="mb-[10px]" name="contextPrompt" serverInvalid={serverErrors.contextPrompt}>
        <Form.Label htmlFor="contextPrompt" className="block text-sm font-medium text-foreground">
          Context Prompt
        </Form.Label>
        <Form.Control asChild>
          <input
            id="contextPrompt"
            type="text"
            defaultValue={contextPrompt}
            className="mt-1 w-full rounded-md border-altBackground bg-background p-2 shadow-sm"
            title="Context prompt for the user"
            placeholder="Enter context prompt"
            required
          />
        </Form.Control>
        {serverErrors.contextPrompt && <Form.Message>Error updating context prompt. Please try again.</Form.Message>}
      </Form.Field>

      <Form.Submit asChild>
        <button type="submit" className="mt-1 w-full rounded-md border-altBackground bg-background p-2 shadow-sm">
          Update
        </button>
      </Form.Submit>
    </Form.Root>
  )
}

export default PromptForm
