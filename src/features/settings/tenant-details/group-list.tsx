"use client"

import * as Form from "@radix-ui/react-form"
import { TrashIcon } from "lucide-react"
import React, { useState, FormEvent } from "react"

import { SUPPORT_EMAIL } from "@/app-global"

import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"

export const GroupList: React.FC<{ tenantGroups: string[] }> = ({ tenantGroups }) => {
  const [groups, setGroups] = useState<string[]>(tenantGroups)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState("")

  const handleNewGroups = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const newGroupGuids = (new FormData(e.currentTarget).get("newGroups") as string).split(",").map(guid => guid.trim())
    await submit([...groups, ...newGroupGuids]).then(() => (e.target as HTMLFormElement)?.reset())
  }
  const handleDeleteGroup = async (groupId: string): Promise<void> => {
    const newGroupGuids = groups.filter(group => group !== groupId)
    await submit(newGroupGuids)
  }

  async function submit(newGroupGuids: string[]): Promise<void> {
    setIsSubmitting(true)
    const previous = groups
    const next = [...new Set(newGroupGuids)]
    setGroups(next)
    const errorMsg = "An error occurred while updating groups. Please try again later."
    try {
      const response = await fetch("/api/tenant/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: next }),
      })
      if (!response.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Tenant groups updated successfully!" })
    } catch (error) {
      setGroups(previous)
      setError(true)
      showError("An error occurred while updating groups. Please try again later.")
      logger.error("Error updating groups", { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteGroupDialog
          group={showDeleteModal}
          loading={isSubmitting}
          onConfirm={handleDeleteGroup}
          onClose={() => setShowDeleteModal("")}
        />
      )}
      <Form.Root className="mt-4" onSubmit={handleNewGroups}>
        <Form.Field name="newGroups" serverInvalid={error}>
          <Form.Label htmlFor="newGroups" className="block">
            Add New Group GUIDs, groups are not currently validated for you (comma-separated):
          </Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              autoComplete="off"
              id="newGroups"
              name="newGroups"
              className="my-4 w-full rounded-md border-2 p-2"
              placeholder="Enter new group GUIDs..."
              aria-label="New group GUIDs"
              disabled={isSubmitting}
              required
            />
          </Form.Control>
          {error && (
            <Form.Message role="alert" className="text-QLD-alert my-4">
              Error updating groups. Please try again later.
            </Form.Message>
          )}
        </Form.Field>
        <Form.Submit asChild>
          <Button
            type="submit"
            variant="default"
            className="mb-4 justify-end"
            disabled={isSubmitting}
            ariaLabel="Update groups"
          >
            {isSubmitting ? "Updating..." : "Update Groups"}
          </Button>
        </Form.Submit>
      </Form.Root>
      <Typography variant="h5" className="mb-4">
        Current Groups:
        {groups?.map(group => (
          <div className="mt-2 flex justify-between rounded-md bg-altBackgroundShade p-2" key={group}>
            <b>{group}</b>
            <Button
              size="sm"
              variant="destructive"
              ariaLabel={`Delete ${group}`}
              onClick={() => setShowDeleteModal(group)}
            >
              <TrashIcon size={16} />
            </Button>
          </div>
        ))}
      </Typography>
    </>
  )
}

const DeleteGroupDialog: React.FC<{
  group: string
  loading: boolean
  onConfirm: (group: string) => Promise<void>
  onClose: () => void
}> = ({ group, loading, onConfirm, onClose }) => {
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
            Are you sure you want to delete this group?
          </Typography>
        </div>
        <div className="mb-4">
          <Typography variant="h5" className="text-foreground" id="dialog-description">
            Group GUID: <b>{group}</b>
          </Typography>
        </div>
        <div className="mb-5">
          <Typography variant="p" className="text-foreground">
            Sessions are valid for up to 8 hours and this will not revoke the user&apos;s access. Reach out to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-bold text-link">
              support
            </a>{" "}
            for urgent assistance.
          </Typography>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading} aria-label="Cancel">
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="ml-2"
            onClick={async () => await onConfirm(group).then(onClose)}
            disabled={loading}
            aria-label="Confirm delete group"
          >
            Delete Group
          </Button>
        </div>
      </div>
    </div>
  )
}
