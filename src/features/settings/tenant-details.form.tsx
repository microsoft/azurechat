"use client"

import * as Form from "@radix-ui/react-form"
import React, { useState, FormEvent, useEffect } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError } from "@/features/globals/global-message-store"
import { showSuccess } from "@/features/globals/global-message-store"
import { TenantDetails } from "@/features/tenant-management/models"
import { Button } from "@/features/ui/button"
import { CardSkeleton } from "@/features/ui/card-skeleton"

interface PromptFormProps {}

export const TenantDetailsForm: React.FC<PromptFormProps> = () => {
  const [tenant, setTenant] = useState<TenantDetails>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({ contextPrompt: false })
  const [isLoading, setIsLoading] = useState(true)
  const [contextPrompt, setContextPrompt] = useState("")

  useEffect(() => {
    async function fetchDetails(): Promise<TenantDetails> {
      const res = await fetch("/api/tenant/details", { method: "GET" })
      return (await res.json()).data as TenantDetails
    }
    fetchDetails()
      .then(res => {
        setTenant(res)
        setContextPrompt(res.preferences.contextPrompt)
      })
      .catch(err => {
        console.error("Failed to fetch tenant preferences:", err)
        showError("Tenant settings couldn't be loaded, please try again.")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const newContextPrompt = new FormData(e.currentTarget).get("contextPrompt") as string

    setIsSubmitting(true)
    setServerErrors({ contextPrompt: false })

    const temp = tenant?.preferences.contextPrompt || ""
    setContextPrompt(newContextPrompt)

    const response = await fetch("/api/tenant/details", {
      method: "POST",
      body: JSON.stringify({
        contextPrompt: newContextPrompt,
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
          TENANT INFORMATION
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">
          Domain:
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div>
              <b>{tenant?.primaryDomain}</b>
            </div>
          )}
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">
          Support Email:
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div>
              <b>{tenant?.supportEmail}</b>
            </div>
          )}
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">
          Department Name:
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <div>
              <b>{tenant?.departmentName}</b>
            </div>
          )}
        </Typography>
      </div>
      <div className="mb-4">
        <Typography variant="h5">
          Administrators:
          {isLoading ? (
            <CardSkeleton size="lg" />
          ) : (
            tenant?.administrators?.map(admin => (
              <div key={admin}>
                <b>{admin}</b>
              </div>
            ))
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
