"use client"

import { FileText, MessageCircle, AudioLines, PencilIcon, TrashIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import React, { FC, useState, useEffect, useRef, useCallback } from "react"

import { MenuItem } from "@/components/menu"
import Typography from "@/components/typography"
import { useChatThreads } from "@/features/chat/chat-ui/chat-threads-context"
import { showError } from "@/features/globals/global-message-store"
import { Button } from "@/features/ui/button"
import { Input } from "@/features/ui/input"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (inputValue?: string) => void
  focusAfterClose: HTMLButtonElement | null
  type: "edit" | "delete"
}

const ChatMenuModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, focusAfterClose, type }) => {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen && type === "edit") {
      inputRef.current?.focus()
    } else if (focusAfterClose) {
      focusAfterClose.focus()
    }
  }, [isOpen, focusAfterClose, type])

  const handleSave = useCallback(() => {
    onSave(inputValue)
    onClose()
  }, [inputValue, onClose, onSave])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-80 flex items-center justify-center bg-black bg-opacity-80 ${isOpen ? "block" : "hidden"}`}
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
            <Input
              id="newChatName"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
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

export const MenuItems: FC = () => {
  const { chatThreadId } = useParams()
  const router = useRouter()
  const { threads, updateThreadTitle, removeThread } = useChatThreads()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null)

  const handleOpenModal = useCallback(
    (chatThreadId: string, type: "edit" | "delete") => () => {
      setSelectedThreadId(chatThreadId)
      setModalType(type)
    },
    []
  )

  const handleCloseModal = useCallback(() => {
    setSelectedThreadId(null)
    setModalType(null)
  }, [])

  const handleSaveModal = async (inputValue?: string): Promise<void> => {
    if (!selectedThreadId) return
    try {
      if (modalType === "edit") {
        await updateThreadTitle(selectedThreadId, (inputValue || "").trim())
      } else if (modalType === "delete") {
        await removeThread(selectedThreadId)
        router.replace("/chat")
      }
    } catch (e) {
      showError("" + e)
    } finally {
      handleCloseModal()
    }
  }

  return threads?.map(thread => (
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
          onClick={handleOpenModal(thread.chatThreadId, "edit")}
        >
          <PencilIcon size={16} />
        </Button>
        <Button
          className="opacity-20 group-hover:opacity-100"
          size="sm"
          variant="destructive"
          ariaLabel={`Delete ${thread.name}`}
          onClick={handleOpenModal(thread.chatThreadId, "delete")}
        >
          <TrashIcon size={16} />
        </Button>
        {selectedThreadId === thread.chatThreadId && modalType && (
          <ChatMenuModal
            isOpen={true}
            onClose={handleCloseModal}
            onSave={handleSaveModal}
            focusAfterClose={null}
            type={modalType}
          />
        )}
      </div>
    </MenuItem>
  ))
}
