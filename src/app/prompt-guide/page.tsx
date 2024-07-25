import { promises as fs } from "fs"

import MarkdownPage from "@/components/markdown/markdown-page"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const content = await loadContent()

  return <MarkdownPage content={content} />
}

const loadContent = async (): Promise<string> => {
  return await fs.readFile(process.cwd() + "/public/guide.md", "utf8")
}
