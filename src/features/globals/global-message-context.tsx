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

interface MessageProp {
  title: string
  description: string
}

export const GlobalMessageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const application = useApplication()
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (!session?.user || !application?.appSettings) return
    let unsubscribe = false

    // check for terms and conditions
    const tAndCs = application.appSettings.termsAndConditionsDate
    if (
      (application.appSettings.termsAndConditionsDate && !session.user.acceptedTermsDate) || // first time user
      new Date(tAndCs).getTime() > new Date(session.user.acceptedTermsDate).getTime() // new terms
    ) {
      announcement.newsflash(<AgreeTermsAndConditions onClose={() => !unsubscribe && announcement.dismiss()} />)
      return
    }

    // check for new what's new
    if (
      !pathname.endsWith("/whats-new") && // don't show on the what's new page
      application.appSettings.version !== session.user.lastVersionSeen // new version
    ) {
      announcement.newsflash(
        <WhatsNewModal
          targetVersion={application.appSettings.version}
          onClose={() => !unsubscribe && announcement.dismiss()}
        />
      )
      return
    }

    return () => {
      unsubscribe = true
    }
  }, [session?.user, application?.appSettings, pathname])

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
  if (!context) throw new Error("GlobalErrorContext hasn't been provided!")
  return context
}
