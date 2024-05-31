import { ToastAction } from "@radix-ui/react-toast"

import { type Toast, toast } from "@/features/ui/use-toast"

export const showError = (
  error: string,
  logError?: (error: Error, properties?: Record<string, unknown>) => void,
  reload?: () => void
): void => {
  if (typeof window !== "undefined")
    toast({
      variant: "destructive",
      description: error,
      action: reload ? (
        <ToastAction altText="Try again" onClick={() => reload()}>
          Try again
        </ToastAction>
      ) : undefined,
    })

  logError?.(new Error(error))
}

export const showSuccess = (
  message: Toast,
  logEvent?: (name: string, properties?: Record<string, unknown>) => void
): void => {
  if (typeof window !== "undefined") toast(message)
  logEvent?.(message.title || "Show Success", { description: message.description })
}
