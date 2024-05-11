"use client"
import { FileText, MessageCircle, Trash, Pencil, AudioLines } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { FC, useState, useEffect, useRef } from "react"

import { MenuItem } from "@/components/menu"
import Typography from "@/components/typography"
import {
  UpdateChatThreadTitle,
  SoftDeleteChatThreadForCurrentUser,
} from "@/features/chat/chat-services/chat-thread-service"
import { ChatThreadModel } from "@/features/chat/models"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"
// import { AlertDialogItem } from "@/features/ui/alert-dialog"
import { Button } from "@/features/ui/button"

interface Prop {
  menuItems: Array<ChatThreadModel>
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newTitle: string) => void
  focusAfterClose: HTMLButtonElement | null
}

const PopupMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="popup-message" role="alert">
    <Typography variant="p">{message}</Typography>
  </div>
)

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, focusAfterClose }): JSX.Element => {
  const [newName, setNewName] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else if (focusAfterClose) {
      focusAfterClose.focus()
    }
  }, [isOpen, focusAfterClose])

  const handleSave = (): void => {
    onSave(newName)
    onClose()
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 2000)
  }

  return (
    <div
      className={`bg-opacity/50 fixed inset-0 z-80 flex items-center justify-center bg-black ${isOpen ? "block" : "hidden"}`}
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-background p-4">
        <div className="mb-4">
          <Typography variant="h4" className="text-foreground">
            Edit Chat Name
          </Typography>
        </div>
        <div className="mb-4">
          <label htmlFor="newChatName" className="block text-sm font-medium text-foreground">
            New Chat Name
          </label>
          <input
            id="newChatName"
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            maxLength={120}
            ref={inputRef}
            className="mt-1 w-full rounded-md border-altBackground bg-background p-2"
            autoComplete="off"
          />
          {newName.length > 30 && newName.length <= 120 && (
            <Typography variant="p" className="mt-2 text-alert">
              Name exceeds 30 characters. Consider shortening it.
            </Typography>
          )}
          {newName.length > 120 && (
            <Typography variant="p" className="mt-2 text-error">
              Name exceeds 120 characters. Please shorten your chat name.
            </Typography>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <Button variant="default" onClick={handleSave} ariaLabel="Save">
            Save
          </Button>
          <Button variant="secondary" onClick={onClose} ariaLabel="Cancel">
            Cancel
          </Button>
        </div>
      </div>
      {showPopup && <PopupMessage message="Chat name updated successfully!" />}
    </div>
  )
}

export const MenuItems: FC<Prop> = ({ menuItems }) => {
  const { chatThreadId } = useParams()
  const router = useRouter()
  const { showError } = useGlobalMessageContext()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [items, setItems] = useState<ChatThreadModel[]>(menuItems)
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  // const [threadIdToDelete, setThreadIdToDelete] = useState<string | null>(null)
  // const handleDelete = async (): Promise<void> => {
  //   if (threadIdToDelete) {
  //     await SoftDeleteChatThreadForCurrentUser(threadIdToDelete)
  //     setItems(prev => prev.filter(item => item.chatThreadId !== threadIdToDelete))
  //     setDeleteDialogOpen(false)
  //     router.replace("/chat")
  //   }
  // }
  const handleDelete = async (threadId: string): Promise<void> => {
    await SoftDeleteChatThreadForCurrentUser(threadId)
    setItems(prev => prev.filter(item => item.chatThreadId !== threadId))
    router.replace("/chat")
  }

  const handleOpenModal = (chatThreadId: string): void => {
    setSelectedThreadId(chatThreadId)
  }

  const handleCloseModal = (): void => {
    setSelectedThreadId(null)
  }

  const handleSaveModal = async (newName: string): Promise<void> => {
    if (newName.trim() !== "" && selectedThreadId) {
      try {
        await UpdateChatThreadTitle(selectedThreadId, newName)
      } catch (e) {
        showError("" + e)
      } finally {
        handleCloseModal()
      }
    }
    router.refresh()
  }

  return (
    <>
      {items.map(thread => (
        <MenuItem
          href={`/chat/${thread.chatThreadId}`}
          isSelected={chatThreadId === thread.chatThreadId}
          key={thread.chatThreadId}
          className="hover:item group relative justify-between"
        >
          {thread.chatType === "data" ? (
            <FileText
              size={16}
              className={chatThreadId === thread.chatThreadId ? "hidden text-brand sm:block" : "hidden sm:block"}
            />
          ) : thread.chatType === "audio" ? (
            <AudioLines
              size={16}
              className={chatThreadId === thread.chatThreadId ? "hidden text-brand sm:block" : "hidden sm:block"}
            />
          ) : (
            <MessageCircle
              size={16}
              className={chatThreadId === thread.chatThreadId ? "hidden text-brand sm:block" : "hidden sm:block"}
            />
          )}
          <Typography variant="span" className="flex flex-1 items-center gap-1 overflow-hidden">
            {thread.name}
          </Typography>
          <div className="hidden gap-1 sm:grid">
            {selectedThreadId !== thread.chatThreadId && (
              <Button
                className="opacity-20 group-hover:opacity-100"
                size="sm"
                variant="accent"
                ariaLabel={`Rename ${thread.name}`}
                onClick={() => handleOpenModal(thread.chatThreadId)}
              >
                <Pencil size={16} />
              </Button>
            )}
            {selectedThreadId === thread.chatThreadId && (
              <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSaveModal} focusAfterClose={null} />
            )}
            <Button
              className="opacity-20 group-hover:opacity-100"
              size={"sm"}
              variant="destructive"
              ariaLabel={`Delete ${thread.name}`}
              onClick={async e => {
                e.preventDefault()
                const yesDelete = confirm("Are you sure you want to delete this chat?")
                if (yesDelete) {
                  await handleDelete(thread.chatThreadId)
                }
                // onClick={() => {
                //   setThreadIdToDelete(thread.chatThreadId)
                //   setDeleteDialogOpen(true)
              }}
            >
              <Trash size={16} />
            </Button>
          </div>
        </MenuItem>
      ))}
      {/* {deleteDialogOpen && (
        <AlertDialogItem
          title="Confirm Deletion"
          type="warning"
          size="medium"
          description="Are you sure you want to delete this chat? This action cannot be undone."
          cancelText="Cancel"
          confirmText="Delete"
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      )} */}
    </>
  )
}
