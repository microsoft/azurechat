import { ToastAction } from "@radix-ui/react-toast"
import { createContext, useContext } from "react"

import { toast } from "@/features/ui/use-toast"

interface GlobalMessageProps {
  showError: (error: string, reload?: () => void) => void
  showSuccess: (message: MessageProp) => void
}

const GlobalMessageContext = createContext<GlobalMessageProps | null>(null)

interface MessageProp {
  title: string
  description: string
}

export const GlobalMessageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const showError = (error: string, reload?: () => void): void => {
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

  const showSuccess = (message: MessageProp): void => {
    toast(message)
  }

  return (
    <GlobalMessageContext.Provider
      value={{
        showSuccess,
        showError,
      }}
    >
      {children}
    </GlobalMessageContext.Provider>
  )
}

export const useGlobalMessageContext = (): GlobalMessageProps => {
  const context = useContext(GlobalMessageContext)
  if (!context) {
    throw new Error("GlobalErrorContext is null")
  }

  return context
}
