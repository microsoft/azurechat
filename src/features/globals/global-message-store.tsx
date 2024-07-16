import { ToastAction } from "@radix-ui/react-toast"

import logger from "@/features/insights/app-insights"
import { type Toast, toast } from "@/features/ui/use-toast"

export const showError = (error: string, reload?: () => void): void => {
  if (typeof window !== "undefined") {
    toast({
      variant: "destructive",
      description: error,
      action: reload ? (
        <ToastAction altText="Try again" onClick={reload}>
          Try again
        </ToastAction>
      ) : undefined,
    })
  }
  logger.error(error)
}

export const showSuccess = (message: Toast): void => {
  if (typeof window !== "undefined") {
    toast(message)
  }
  logger.event(message.title || "Show Success", { description: message.description })
}
