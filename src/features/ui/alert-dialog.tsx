import * as AlertDialog from "@radix-ui/react-alert-dialog"
import React from "react"

import { Button } from "./button"

interface AlertDialogProps {
  title: string
  description: string
  cancelText: string
  confirmText: string
  onCancel: () => void
  onConfirm: () => void
  type?: "error" | "success" | "info" | "warning"
  size?: "small" | "medium" | "large"
}

export const AlertDialogItem: React.FC<AlertDialogProps> = ({
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  type = "info",
  size = "medium",
}) => (
  <AlertDialog.Root>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
      <AlertDialog.Content
        className={`rounded-lg p-6 shadow-lg ${
          size === "small" ? "max-w-md" : size === "large" ? "max-w-xl" : "max-w-lg"
        } ${type === "error" ? "bg-error" : type === "success" ? "bg-success" : type === "info" ? "bg-information" : "bg-alert"}`}
      >
        <AlertDialog.Title className="mb-4 text-lg font-bold leading-tight">{title}</AlertDialog.Title>
        <AlertDialog.Description className="mb-4">{description}</AlertDialog.Description>
        <div className="flex justify-end gap-4">
          <AlertDialog.Cancel asChild>
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmText}
            </Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
)

export default AlertDialogItem
