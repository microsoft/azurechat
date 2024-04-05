import { promises as fs } from "fs"

import { Markdown } from "@/components/markdown/markdown"
import { Card } from "@/features/ui/card"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const content = await loadContent()
  return (
    <Card className="flex h-full flex-1 justify-center">
      <div className="flex flex-col gap-8 py-8">
        <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 ">
          <Markdown content={content} />
        </div>
      </div>
    </Card>
  )
}

const loadContent = async (): Promise<string> => {
  return await fs.readFile(process.cwd() + "/public/guide.md", "utf8")
}
