import { APP_NAME, AGENCY_NAME, APP_VERSION } from "@/app-global"

import { Markdown } from "./markdown"

interface MarkdownPlaceholderProps {
  content: string
}

export const MarkdownPlaceholder: React.FC<MarkdownPlaceholderProps> = ({ content }) => {
  const contentWithPlaceholders = content
    .replace(/{{APP_NAME}}/g, APP_NAME)
    .replace(/{{AGENCY_NAME}}/g, AGENCY_NAME)
    .replace(/{{APP_VERSION}}/g, APP_VERSION)

  return <Markdown content={contentWithPlaceholders} />
}

export default MarkdownPlaceholder
