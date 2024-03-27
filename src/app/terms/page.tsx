import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { Card } from "@/features/ui/card"
import { promises as fs } from "fs"
import APP_VERSION from "@/app-global"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const content = await loadContent()
  const versionNum = APP_VERSION
  return (
    <Card className="flex h-full flex-1 justify-center overflow-y-scroll">
      <div className="flex flex-col gap-8 py-8">
        <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 ">
          <Typography variant="h1">App Version {versionNum}</Typography>
          <Markdown content={content} />
        </div>
      </div>
    </Card>
  )
}

const loadContent = async (): Promise<string> => {
  return await fs.readFile(process.cwd() + "/public/terms.md", "utf8")
}
