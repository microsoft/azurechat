import { Loader } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"

import { APP_VERSION } from "@/app-global"

import useOnScreen from "@/components/hooks/use-on-screen"
import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/features/ui/dialog"
import { cn } from "@/lib/utils"

type AgreeTermsAndConditionsProps = { onClose: () => void }
export default function AgreeTermsAndConditions({ onClose }: AgreeTermsAndConditionsProps): JSX.Element {
  const { update } = useSession()
  const [content, setContent] = useState<string>("Loading terms and conditions...")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [canSubmit, setCanSubmit] = useState<boolean>(false)
  const endOfScrollRef = useRef<HTMLDivElement>(null)
  const isEndOfScroll = useOnScreen(endOfScrollRef)

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/user/terms-and-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await update({ acceptedTerms: true })
      showSuccess({ title: "Terms and conditions agreed" })
      onClose()
    } catch (error) {
      logger.error("Failed to agree to terms and conditions, please try again later.", { error })
      showError("Failed to agree to terms and conditions, please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetch("/api/application/terms")
      .then(async response => await response.text())
      .then(data => setContent(data))
      .catch(() => {
        logger.error("Failed to load terms and conditions, please try again later.")
        onClose()
      })
      .finally(() => setIsLoading(false))
  }, [onClose])

  useEffect(() => {
    if (isEndOfScroll) setCanSubmit(true)
  }, [isEndOfScroll])

  return (
    <Dialog>
      <DialogHeader>Terms & Conditions Updates</DialogHeader>
      <DialogContent>
        <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
          <Typography variant="h3">App Version {APP_VERSION}</Typography>
          {isLoading ? "Loading terms and conditions..." : <Markdown content={content} />}
          <div ref={endOfScrollRef} id="sentinel" />
        </div>
      </DialogContent>
      <DialogFooter>
        {isSubmitting && <Loader className={cn("animate-spin")} size={24} />}
        <Button variant="default" onClick={handleSubmit} disabled={!canSubmit || isLoading || isSubmitting}>
          Agree to terms and conditions
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
