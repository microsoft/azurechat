import { ToastAction } from "@radix-ui/react-toast"

import { toast } from "@/features/ui/use-toast"

interface MessageProp {
  title: string
  description: string
}

export const showError = (
  error: string,
  logError?: (error: Error, properties?: Record<string, unknown>) => void,
  reload?: () => void
): void => {
  toast({
    variant: "destructive",
    description: error,
    action: reload ? (
      <ToastAction
        altText="Try again"
        onClick={() => {
          reload()
        }}
      >
        Try again
      </ToastAction>
    ) : undefined,
  })
  if (logError) {
    logError(new Error(error))
  }
}

export const showSuccess = (
  message: MessageProp,
  logEvent?: (name: string, properties?: Record<string, unknown>) => void
): void => {
  toast(message)
  if (logEvent) {
    logEvent(message.title, { description: message.description })
  }
}
