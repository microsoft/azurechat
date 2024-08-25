import { ToastAction } from "@radix-ui/react-toast"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { createContext, useContext, useEffect } from "react"

import AgreeTermsAndConditions from "@/components/announcement/agree-terms-and-conditions"
import WhatsNewModal from "@/components/announcement/whats-new-modal"

import { toast } from "@/features/ui/use-toast"

import { announcement } from "./announcements"
import { useApplication } from "./application-provider"

interface GlobalMessageProps {
  showError: (error: string, reload?: () => void) => void
  showSuccess: (message: MessageProp) => void
}

const GlobalMessageContext = createContext<GlobalMessageProps | null>(null)
const DELAY_ANNOUNCEMENTS = 3000

interface MessageProp {
  title: string
  description: string
}

function useGlobalMessageContextHook(): GlobalMessageProps {
  const application = useApplication()
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (!session?.user || !application?.appSettings) return
    let unsubscribe = false

    const timeoutId = setTimeout(() => {
      // check for terms and conditions
      const tAndCs = application.appSettings.termsAndConditionsDate
      if (
        (application.appSettings.termsAndConditionsDate && !session.user.acceptedTermsDate) ||
        new Date(tAndCs).getTime() > new Date(session.user.acceptedTermsDate).getTime()
      ) {
        announcement.newsflash(<AgreeTermsAndConditions onClose={() => !unsubscribe && announcement.dismiss()} />)
        return
      }

      // check for new what's new
      if (
        !sessionStorage.getItem("whats-new-dismissed") &&
        !pathname.endsWith("/whats-new") &&
        application.appSettings.version !== session.user.lastVersionSeen
      ) {
        announcement.newsflash(
          <WhatsNewModal
            targetVersion={application.appSettings.version}
            onClose={() => !unsubscribe && announcement.dismiss()}
          />
        )
        return
      }
    }, DELAY_ANNOUNCEMENTS)

    return () => {
      unsubscribe = true
      clearTimeout(timeoutId)
    }
  }, [session?.user, application?.appSettings, pathname])

  const showError = (error: string, reload?: () => void): void => {
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

  const showSuccess = (message: MessageProp): void => {
    toast(message)
  }

  return {
    showError,
    showSuccess,
  }
}

export const GlobalMessageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const value = useGlobalMessageContextHook()

  return <GlobalMessageContext.Provider value={value}>{children}</GlobalMessageContext.Provider>
}

export const useGlobalMessageContext = (): GlobalMessageProps => {
  const context = useContext(GlobalMessageContext)
  if (!context) throw new Error("GlobalErrorContext hasn't been provided!")
  return context
}
