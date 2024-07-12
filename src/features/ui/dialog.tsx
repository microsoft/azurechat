"use client"

import { X } from "lucide-react"
import { ReactNode, createContext, forwardRef, useContext } from "react"

import useFocusTrap from "@/components/hooks/use-focus-trap"
import useOnClickOutside from "@/components/hooks/use-on-click-outside"
import { cn } from "@/lib/utils"

type DialogContextDefinition = {
  onClose?: () => void
}
const DialogContext = createContext<DialogContextDefinition>({})
export const useDialogContext = (): DialogContextDefinition => {
  const context = useContext(DialogContext)
  if (!context) throw new Error("DialogContext hasn't been provided! Make sure to wrap your component with <Dialog>.")
  return context
}

export const Dialog = forwardRef<HTMLDivElement, { children: ReactNode; className?: string; onClose?: () => void }>(
  ({ children, className, onClose }, ref) => {
    const modalRef = useFocusTrap<HTMLDivElement>(null)
    useOnClickOutside(modalRef, () => onClose?.())

    return (
      <DialogContext.Provider value={{ onClose: onClose }}>
        <div ref={modalRef} className={cn("my-[8rem] w-[500px]", className)} role="dialog">
          <div
            ref={ref}
            className={cn(
              "flex max-h-[calc(100vh-16rem)] min-h-[16rem] flex-col rounded-md border-2 bg-background",
              className
            )}
          >
            {children}
          </div>
        </div>
      </DialogContext.Provider>
    )
  }
)
Dialog.displayName = "Dialog"

export const DialogHeader = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    const { onClose } = useDialogContext()
    return (
      <div ref={ref} className={cn("relative rounded-t-md bg-background p-4 text-lg font-bold lg:p-6", className)}>
        {onClose && <X className="absolute right-4 top-4 cursor-pointer" onClick={onClose} />}
        {children}
      </div>
    )
  }
)
DialogHeader.displayName = "DialogHeader"

export const DialogContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    useDialogContext()
    return (
      <>
        <hr className="border-t" />
        <div ref={ref} className={cn("overflow-y-auto bg-altBackground p-4 lg:px-6", className)}>
          {children}
        </div>
        <hr className="border-t" />
      </>
    )
  }
)
DialogContent.displayName = "DialogContent"

export const DialogFooter = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    useDialogContext()
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-end gap-4 rounded-b-md bg-background p-4 lg:px-6", className)}
      >
        {children}
      </div>
    )
  }
)
DialogFooter.displayName = "DialogFooter"
