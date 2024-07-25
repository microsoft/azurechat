import { APP_NAME, AGENCY_NAME, APP_VERSION } from "@/app-global"

import Typography from "@/components/typography"
import { Card } from "@/features/ui/card"

import { Markdown } from "./markdown"

interface MarkDownPageProps {
  content: string
}

const MarkDownPage: React.FC<MarkDownPageProps> = ({ content }) => {
  const appName = APP_NAME
  const agencyName = AGENCY_NAME
  const versionNum = APP_VERSION

  const contentWithPlaceholders = content
    .replace(/{{APP_NAME}}/g, appName)
    .replace(/{{AGENCY_NAME}}/g, agencyName)
    .replace(/{{APP_VERSION}}/g, versionNum)

  return (
    <Card className="flex h-full flex-1 justify-center">
      <div className="flex flex-col gap-8 py-8">
        <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
          <Typography variant="h3">App Version {versionNum}</Typography>
          <Markdown content={contentWithPlaceholders} />
        </div>
      </div>
    </Card>
  )
}

export default MarkDownPage
