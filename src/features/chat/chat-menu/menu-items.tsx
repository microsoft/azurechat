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
  onSave: (inputValue?: string) => void
  focusAfterClose: HTMLButtonElement | null
  type: "edit" | "delete"
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, focusAfterClose, type }): JSX.Element => {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (type === "edit") {
        inputRef.current?.focus()
      }
    } else if (focusAfterClose) {
      focusAfterClose.focus()
    }
  }, [isOpen, focusAfterClose, type])

  const handleSave = (): void => {
    onSave(inputValue)
    onClose()
  }

  return (
    <div
      className={`bg-opacity/50 fixed inset-0 z-80 flex items-center justify-center bg-black ${isOpen ? "block" : "hidden"}`}
    >
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-background p-4">
        <div className="mb-4">
          <Typography variant="h4" className="text-foreground">
            {type === "edit" ? "Edit Chat Name" : "Are you sure you want to delete this chat?"}
          </Typography>
        </div>
        {type === "edit" && (
          <div className="mb-4">
            <label htmlFor="newChatName" className="block text-sm font-medium text-foreground">
              New Chat Name
            </label>
            <input
              id="newChatName"
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              maxLength={120}
              ref={inputRef}
              className="mt-1 w-full rounded-md border-altBackground bg-background p-2"
              autoComplete="off"
            />
            {inputValue.length > 30 && inputValue.length <= 120 && (
              <Typography variant="p" className="mt-2 text-alert">
                Name exceeds 30 characters. Consider shortening it.
              </Typography>
            )}
            {inputValue.length > 120 && (
              <Typography variant="p" className="mt-2 text-error">
                Name exceeds 120 characters. Please shorten your chat name.
              </Typography>
            )}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-4">
          <Button variant="default" onClick={handleSave} ariaLabel="Save">
            {type === "edit" ? "Save" : "Confirm"}
          </Button>
          <Button variant="secondary" onClick={onClose} ariaLabel="Cancel">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export const MenuItems: FC<Prop> = ({ menuItems }) => {
  const { chatThreadId } = useParams()
  const router = useRouter()
  const { showError } = useGlobalMessageContext()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null)
  const [items, setItems] = useState<ChatThreadModel[]>(menuItems)

  const handleOpenModal = (chatThreadId: string, type: "edit" | "delete"): void => {
    setSelectedThreadId(chatThreadId)
    setModalType(type)
  }

  const handleCloseModal = (): void => {
    setSelectedThreadId(null)
    setModalType(null)
  }

  const handleSaveModal = async (inputValue?: string): Promise<void> => {
    if (modalType === "edit" && (inputValue ?? "").trim() !== "" && selectedThreadId) {
      try {
        await UpdateChatThreadTitle(selectedThreadId, inputValue || "")
        setItems(prevItems =>
          prevItems.map(item =>
            item.chatThreadId === selectedThreadId ? { ...item, name: inputValue || item.name } : item
          )
        )
      } catch (e) {
        showError("" + e)
      } finally {
        handleCloseModal()
      }
    } else if (modalType === "delete" && selectedThreadId) {
      try {
        await SoftDeleteChatThreadForCurrentUser(selectedThreadId)
        setItems(prev => prev.filter(item => item.chatThreadId !== selectedThreadId))
        router.replace("/chat") // This is where you navigate to the "/chat" route
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
            <Button
              className="opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel={`Rename ${thread.name}`}
              onClick={() => handleOpenModal(thread.chatThreadId, "edit")}
            >
              <Pencil size={16} />
            </Button>
            <Button
              className="opacity-20 group-hover:opacity-100"
              size="sm"
              variant="destructive"
              ariaLabel={`Delete ${thread.name}`}
              onClick={() => handleOpenModal(thread.chatThreadId, "delete")}
            >
              <Trash size={16} />
            </Button>
            {selectedThreadId === thread.chatThreadId && modalType && (
              <Modal
                isOpen={true}
                onClose={handleCloseModal}
                onSave={handleSaveModal}
                focusAfterClose={null}
                type={modalType}
              />
            )}
          </div>
        </MenuItem>
      ))}
    </>
  )
}
