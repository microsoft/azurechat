import { Pencil, Trash } from "lucide-react"
import { FC, useCallback } from "react"

import { Button } from "@/features/ui/button"

export interface MenuItemActionsProps {
  threadId: string
  threadName: string
  onEdit: (threadId: string) => void
  onDelete: (threadId: string) => void
}

export const MenuItemActions: FC<MenuItemActionsProps> = ({ threadId, threadName, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(threadId), [onEdit, threadId])
  const handleDelete = useCallback(() => onDelete(threadId), [onDelete, threadId])

  return (
    <>
      <Button
        className="opacity-20 group-hover:opacity-100"
        size="sm"
        variant="accent"
        ariaLabel={`Rename ${threadName}`}
        onClick={handleEdit}
      >
        <Pencil size={16} />
      </Button>
      <Button
        className="opacity-20 group-hover:opacity-100"
        size="sm"
        variant="destructive"
        ariaLabel={`Delete ${threadName}`}
        onClick={handleDelete}
      >
        <Trash size={16} />
      </Button>
    </>
  )
}

export default MenuItemActions
