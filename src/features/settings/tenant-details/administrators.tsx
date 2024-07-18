"use client"

import * as Form from "@radix-ui/react-form"
import { ChevronUpIcon, TrashIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import React, { FormEvent, useState } from "react"

import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"
import { Input } from "@/features/ui/input"

export const Administrators: React.FC<{ administrators: string[]; tenantId: string }> = ({
  administrators = [],
  tenantId,
}) => {
  const DEFAULT_ITEMS_TO_SHOW = 6
  const [showMore, setShowMore] = useState(false)
  const session = useSession()
  const [adminEmails, setAdminEmails] = useState<string[]>(administrators)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState("")

  const isAdmin = session?.data?.user?.admin

  const handleNewTenantAdmins = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const newTenantAdminEmails = (form.get("newTenantAdmin") as string).split(",").map(guid => guid.trim())
    try {
      await submit([...adminEmails, ...newTenantAdminEmails])
      ;(e.target as HTMLFormElement)?.reset()
    } catch (error) {
      logger.error("Error submitting new adminEmails", { error })
    }
  }
  const handleDeleteAdmin = async (groupId: string): Promise<void> => {
    const newAdminEmails = adminEmails.filter(group => group !== groupId)
    await submit(newAdminEmails)
  }

  async function submit(newAdminEmails: string[]): Promise<void> {
    setIsSubmitting(true)
    const previous = adminEmails
    const next = [...new Set(newAdminEmails)]
    setAdminEmails(next)
    const errorMsg = "An error occurred while updating tenant administrators. Please try again later."
    try {
      const response = await fetch(`/api/tenant/${tenantId}/administrators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ administrators: next }),
      })
      if (!response.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Tenant administrators updated successfully!" })
    } catch (error) {
      setAdminEmails(previous)
      setError(true)
      showError("An error occurred while updating tenant administrators. Please try again later.")
      logger.error("Error updating tenant administrators", { error })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="mb-4 border-y-2 py-2">
      <Typography variant="h5" className="border-1 flex flex-col rounded-md p-2">
        Administrators:
      </Typography>
      {isAdmin && (
        <>
          {showDeleteModal && (
            <DeleteAdminDialog
              adminEmail={showDeleteModal}
              loading={isSubmitting}
              onConfirm={handleDeleteAdmin}
              onClose={() => setShowDeleteModal("")}
            />
          )}
          <Form.Root className="mt-4" onSubmit={handleNewTenantAdmins}>
            <Form.Field name="newTenantAdmin" serverInvalid={error}>
              <Form.Label htmlFor="newTenantAdmin" className="block">
                Add new tenant administrator email:
              </Form.Label>
              <Form.Control asChild>
                <Input
                  type="email"
                  multiple
                  autoComplete="off"
                  id="newTenantAdmin"
                  name="newTenantAdmin"
                  className="my-4 w-full"
                  placeholder="Enter new email address"
                  aria-label="New email address"
                  disabled={isSubmitting}
                  required
                />
              </Form.Control>
              {error && (
                <Form.Message role="alert" className="text-QLD-alert my-4">
                  Error updating tenant administrators list. Please try again later.
                </Form.Message>
              )}
            </Form.Field>
            <div className="flex justify-end">
              <Form.Submit asChild>
                <Button
                  type="submit"
                  variant="default"
                  className="mb-4 min-w-[190px]"
                  disabled={isSubmitting}
                  ariaLabel="Add Administrator"
                >
                  {isSubmitting ? "Adding..." : "Add Administrator"}
                </Button>
              </Form.Submit>
            </div>
          </Form.Root>
        </>
      )}
      {adminEmails
        .sort((a, b) => a.localeCompare(b))
        .filter((_, index) => showMore || index < DEFAULT_ITEMS_TO_SHOW)
        .map(email => (
          <div className="mt-2 flex justify-between rounded-md bg-altBackgroundShade p-2" key={email}>
            <b>{email}</b>
            {isAdmin && (
              <Button
                size="sm"
                variant="destructive"
                ariaLabel={`Delete ${email}`}
                onClick={() => setShowDeleteModal(email)}
              >
                <TrashIcon size={16} />
              </Button>
            )}
          </div>
        ))}
      {adminEmails.length > DEFAULT_ITEMS_TO_SHOW && (
        <div
          className="mt-2 flex w-full transform cursor-pointer justify-center gap-2 rounded-md border-2 border-altBorder duration-300 animate-in"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show Less" : "Show More"}
          <ChevronUpIcon className={`h-6 w-6 transform duration-300 animate-in ${showMore ? "" : "rotate-180"}`} />
        </div>
      )}
    </div>
  )
}

const DeleteAdminDialog: React.FC<{
  adminEmail: string
  loading: boolean
  onConfirm: (email: string) => Promise<void>
  onClose: () => void
}> = ({ adminEmail: email, loading, onConfirm, onClose }) => {
  const handleClick = async (): Promise<void> => {
    try {
      await onConfirm(email)
      onClose()
    } catch (error) {
      logger.error("Error confirming administrator", { error })
    }
  }
  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black bg-opacity-80"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-background p-4">
        <div className="mb-4">
          <Typography variant="h4" className="text-foreground" id="dialog-title">
            Are you sure you want to delete this administrator?
          </Typography>
        </div>
        <div className="mb-4">
          <Typography variant="h5" className="text-foreground" id="dialog-description">
            Administrator: <b>{email}</b>
          </Typography>
        </div>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={onClose} disabled={loading} ariaLabel="Cancel">
            Cancel
          </Button>
          <Button
            variant="default"
            className="ml-2"
            onClick={handleClick}
            disabled={loading}
            ariaLabel="Confirm delete administrator"
          >
            Delete Administrator
          </Button>
        </div>
      </div>
    </div>
  )
}
