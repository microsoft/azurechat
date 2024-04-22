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
    <p>{message}</p>
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
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-altBackground p-4">
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
            className="mt-1 w-full rounded-md border-altBackground bg-background p-2 shadow-sm"
            autoComplete="off"
          />
          {newName.length > 30 && newName.length <= 120 && (
            <p className="mt-2 text-sm text-accent">Name exceeds 30 characters. Consider shortening it.</p>
          )}
          {newName.length > 120 && (
            <p className="mt-2 text-sm text-red-500">Name exceeds 120 characters. Please shorten your chat name.</p>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <Button variant="default" onClick={handleSave} aria-label="Save">
            Save
          </Button>
          <Button variant="secondary" onClick={onClose} aria-label="Cancel">
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
            <FileText size={16} className={chatThreadId === thread.chatThreadId ? " text-brand" : ""} />
          ) : thread.chatType === "audio" ? (
            <AudioLines size={16} className={chatThreadId === thread.chatThreadId ? " text-brand" : ""} />
          ) : (
            <MessageCircle size={16} className={chatThreadId === thread.chatThreadId ? " text-brand" : ""} />
          )}
          <span className="flex flex-1 items-center gap-2 overflow-hidden">
            <span className="truncate">{thread.name}</span>
          </span>
          {selectedThreadId !== thread.chatThreadId && (
            <Button
              className="invisible group-hover:visible"
              size="sm"
              variant="default"
              aria-label={`Edit ${thread.name}`}
              onClick={() => handleOpenModal(thread.chatThreadId)}
            >
              <Pencil size={16} />
            </Button>
          )}
          {selectedThreadId === thread.chatThreadId && (
            <Modal isOpen={true} onClose={handleCloseModal} onSave={handleSaveModal} focusAfterClose={null} />
          )}
          <Button
            className="invisible group-hover:visible"
            size={"sm"}
            variant="default"
            aria-label="Delete Chat"
            onClick={async e => {
              e.preventDefault()
              const yesDelete = confirm("Are you sure you want to delete this chat?")
              if (yesDelete) {
                await handleDelete(thread.chatThreadId)
              }
            }}
          >
            <Trash size={16} />
          </Button>
        </MenuItem>
      ))}
    </>
  )
}
