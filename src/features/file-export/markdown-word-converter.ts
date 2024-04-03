import { Document, Packer, Paragraph, HeadingLevel } from "docx"
import { saveAs } from "file-saver"
import { marked } from "marked"

import { toast } from "@/features/ui/use-toast"

import { CustomRenderer } from "./custom-renderer"
import { createParagraphFromHtml, processCitationsInText } from "./word-document-utils"

interface MessageType {
  role: string
  content: string
}

export const convertMarkdownToWordDocument = async (
  messages: MessageType[],
  fileName: string,
  aiName: string,
  _userId: string,
  _tenantId: string,
  _chatThreadId: string
): Promise<void> => {
  const renderer = new CustomRenderer()
  marked.use({ renderer })

  const messageParagraphPromises = messages.map(async message => {
    const author = message.role === "system" || message.role === "assistant" ? aiName : "You"
    const authorParagraph = new Paragraph({
      text: `${author}:`,
      heading: HeadingLevel.HEADING_2,
    })

    const processedContent = processCitationsInText(message.content)
    const content = await marked.parse(processedContent)
    const contentParagraphs = createParagraphFromHtml(content)

    return [authorParagraph, ...contentParagraphs, new Paragraph("")]
  })

  const messageParagraphs = (await Promise.all(messageParagraphPromises)).flat()

  const doc = new Document({
    sections: [{ children: messageParagraphs }],
  })

  Packer.toBlob(doc)
    .then(blob => {
      saveAs(blob, fileName)
      toast({
        title: "Success",
        description: "Chat exported to Word document",
      })
    })
    .catch(_err => {
      toast({
        title: "Error",
        description: "Failed to export chat to Word document",
      })
    })
}
