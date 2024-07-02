import fs from "fs/promises"

import { NextRequest } from "next/server"

const loadContent = async (content: string): Promise<string> => {
  return await fs.readFile(process.cwd() + `/public/${content}.md`, "utf8")
}

export async function GET(_request: NextRequest, { params }: { params: { content: string } }): Promise<Response> {
  const content = await loadContent(params.content)
  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/markdown" },
  })
}
