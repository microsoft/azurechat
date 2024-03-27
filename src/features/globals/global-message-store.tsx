import { ToastAction } from "@radix-ui/react-toast"
import { toast } from "../ui/use-toast"

interface MessageProp {
  title: string
  description: string
}

export const showError = (error: string, reload?: () => void): void => {
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
}
export const showSuccess = (message: MessageProp): void => {
  toast(message)
}
