import * as Form from "@radix-ui/react-form"
import { useRef, useState } from "react"

import Typography from "@/components/typography"

import logger from "@/features/insights/app-insights"
import { IndexModel } from "@/features/models/index-models"
import { Button } from "@/features/ui/button"
import { Input } from "@/features/ui/input"
import { Select } from "@/features/ui/select"
import { SwitchComponent } from "@/features/ui/switch"
import { Textarea } from "@/features/ui/textarea"

type IndexFormProps = {
  formValues: IndexModel
  onSubmit: (index: IndexModel) => Promise<void>
  onDelete?: (indexId: string) => Promise<void>
  onClose?: () => void
}
export default function IndexForm({ formValues, onSubmit, onDelete, onClose }: IndexFormProps): JSX.Element {
  const isCreating = !!onClose
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formValueRef = useRef(formValues)
  const [formState, setFormState] = useState(formValues)
  const [isPristine, setIsPristine] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target
    setFormState({ ...formState, [name]: value })
    setIsPristine(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    try {
      event.preventDefault()
      setIsSubmitting(true)
      await onSubmit(formState)
      formValueRef.current = formState
      setIsPristine(true)
      if (isCreating) onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    try {
      setIsSubmitting(true)
      await onDelete?.(formState.id)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {showDeleteModal && (
        <DeleteIndexDialog
          name={formState.name}
          loading={isSubmitting}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
      <Form.Root className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <Form.Field name={"id"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"id"} className="text-right">
            Id:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="text"
              autoComplete="off"
              id="id"
              name="id"
              className="w-full"
              placeholder="Index id"
              aria-label="Index id"
              disabled={isSubmitting || !isCreating}
              value={formState.id}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"name"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"name"} className="text-right">
            Name:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="text"
              autoComplete="off"
              id="name"
              name="name"
              className="w-full"
              placeholder="Index name"
              aria-label="Index name"
              disabled={isSubmitting}
              value={formState.name}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"description"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"description"} className="text-right">
            Description:
          </Form.Label>
          <Form.Control asChild>
            <Textarea
              autoComplete="off"
              id="description"
              name="description"
              className="w-full rounded-md border-2 p-2"
              placeholder="Index description"
              aria-label="Index description"
              rows={4}
              disabled={isSubmitting}
              value={formState.description}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"enable"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"enable"} className="text-right">
            Status:
          </Form.Label>
          <Form.Control asChild>
            <SwitchComponent
              id={"enabled"}
              name={"enabled"}
              variant="default"
              label={`${formState.enabled ? "Enabled" : "Disabled"}`}
              isChecked={!!formState.enabled}
              disabled={isSubmitting}
              onCheckedChange={() => {
                setFormState(prev => ({ ...prev, enabled: !formState.enabled }))
                setIsPristine(false)
              }}
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"isPublic"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"isPublic"} className="text-right">
            Visibility:
          </Form.Label>
          <Select
            value={formState.isPublic ? "public" : "private"}
            label="Select Visibility"
            options={[
              { value: "public", label: "Public to all tenants" },
              { value: "private", label: "Restricted to authorised tenants" },
            ]}
            onValueChange={() => {
              setFormState(prev => ({ ...prev, isPublic: !formState.isPublic }))
              setIsPristine(false)
            }}
            disabled={isSubmitting}
          />
        </Form.Field>
        <div className="mb-4 flex justify-end gap-4">
          {!isCreating && (
            <Button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-[14rem] justify-self-start"
              variant={"destructive"}
              disabled={isSubmitting}
              ariaLabel="Delete"
            >
              Delete Index
            </Button>
          )}
          {isCreating ? (
            <Button
              type="button"
              onClick={onClose}
              className="w-[14rem]"
              variant={"destructive"}
              disabled={isSubmitting}
              ariaLabel="Close"
            >
              Close
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setFormState(formValueRef.current)
                setIsPristine(true)
              }}
              className="w-[14rem]"
              variant={"outline"}
              disabled={isSubmitting || isPristine}
              ariaLabel="Cancel"
            >
              Discard changes
            </Button>
          )}
          <Form.Submit asChild>
            <Button
              type="submit"
              className="w-[14rem]"
              variant="default"
              disabled={isSubmitting || (isPristine && !isCreating)}
              ariaLabel="Save changes"
            >
              {isSubmitting ? "Processing..." : `${isCreating ? "Create Feature" : "Save changes"}`}
            </Button>
          </Form.Submit>
        </div>
      </Form.Root>
    </>
  )
}

const DeleteIndexDialog: React.FC<{
  name: string
  loading: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}> = ({ name, loading, onConfirm, onClose }) => {
  const handleClick = async (): Promise<void> => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      logger.error(`Error deleting smart index: ${name}`, { error })
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
            Are you sure you want to delete &quot;{name}&quot; index?
          </Typography>
        </div>
        <div className="mb-4">
          <Typography variant="h5" className="text-foreground" id="dialog-description">
            It will be removed from all tenants and any custom configuration will be lost. This action cannot be undone.
          </Typography>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading} ariaLabel="Cancel">
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="ml-2"
            onClick={handleClick}
            disabled={loading}
            ariaLabel="Confirm delete index"
          >
            Delete index
          </Button>
        </div>
      </div>
    </div>
  )
}
