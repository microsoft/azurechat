"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Copy, Info } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/features/ui/dialog"
import { Button } from "@/features/ui/button"

const InfoModal = () => {
    const [isOpen, setIsOpen] = useState(false)
    const environment = process.env.NODE_ENV || "Not available"
    const { data: session } = useSession()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === ">") {
        setIsOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Information
          </DialogTitle>
          <DialogDescription>Details about the current application environment</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Environment:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{environment}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(environment)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy environment</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Token:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground max-w-[200px] truncate">
                {session?.user?.accessToken || "Not authenticated"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => session?.user?.accessToken && copyToClipboard(session.user.accessToken)}
                disabled={!session?.user?.accessToken}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy auth token</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InfoModal