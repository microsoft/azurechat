import React from "react"
import { Mail } from "lucide-react"
import Typography from "@/components/typography"

export const Footer: React.FC = () => {
  return (
    <footer className="h-1/6 border-t-4 border-accent bg-background py-5" role="contentinfo">
      <div className="container mx-auto flex items-center justify-between">
        <a href="https://qchat.ai.qld.gov.au" className="flex items-center">
          <Typography variant="h5">qchat.ai.qld.gov.au</Typography>
        </a>

        <div>
          <a href="mailto:qchat@chde.qld.gov.au" className="flex items-center">
            <Mail className="mr-2 size-4" />
            <Typography variant="h5">Contact us</Typography>
          </a>
        </div>
      </div>
    </footer>
  )
}
