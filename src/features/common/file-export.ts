import { Document, Paragraph, Packer, TextRun, HeadingLevel, IStylesOptions, INumberingOptions } from "docx"
import { IPropertiesOptions } from "docx/build/file/core-properties/properties"
import { saveAs } from "file-saver"
import { marked } from "marked"

import { showError, showSuccess } from "@/features/globals/global-message-store"

interface MessageType {
  role: string
  content: string
}

const numbering: INumberingOptions = {
  config: [
    {
      reference: "myDecimal",
      levels: [
        {
          level: 0,
          format: "decimal",
          text: "%1.",
          alignment: "left",
          style: {
            paragraph: {
              indent: { left: 720, hanging: 260 },
            },
          },
        },
      ],
    },
  ],
}

const customStyles: IStylesOptions = {
  paragraphStyles: [
    {
      id: "MyCustomHeading1",
      name: "My Custom Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        size: 28,
        bold: true,
        font: "Aptos",
        color: "2E74B5",
      },
      paragraph: {
        spacing: { after: 240 },
      },
    },
    {
      id: "MyCustomParagraph",
      name: "My Custom Paragraph",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        size: 22,
        font: "Aptos",
      },
    },
    {
      id: "MyCustomCode",
      name: "My Custom Code Block",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: "Aptos", // Monospaced font for code
        size: 20, // Smaller size for code blocks
        color: "006633",
      },
      paragraph: {
        spacing: { after: 120 }, // Adjust spacing to your liking
      },
    },
    {
      id: "MyCustomList",
      name: "My Custom List Item",
      basedOn: "MsoListParagraph",
      next: "Normal",
      quickFormat: true,
      run: {
        font: "Aptos",
        size: 18,
      },
      paragraph: {
        spacing: { after: 30 },
        numbering: {
          reference: "myDecimal",
          level: 0,
        },
      },
    },
  ],
  characterStyles: [
    {
      id: "MyCustomBoldText",
      name: "My Custom Bold Text",
      basedOn: "DefaultParagraphFont",
      run: {
        bold: true,
        size: 24,
      },
    },
  ],
}

class CustomRenderer extends marked.Renderer {
  paragraph(text: string): string {
    return `<p>${text}</p>`
  }

  strong(text: string): string {
    return `<strong>${text}</strong>`
  }

  em(text: string): string {
    return `<em>${text}</em>`
  }

  heading(text: string, level: number): string {
    return `<h${level}>${text}</h${level}>`
  }

  link(href: string, title: string | null | undefined, text: string): string {
    return `<a href="${href}" title="${title || ""}">${text}</a>`
  }

  image(href: string, title: string | null, text: string): string {
    return `<img src="${href}" alt="${text}" title="${title || ""}" />`
  }

  list(body: string, ordered: boolean): string {
    const tag = ordered ? "ol" : "ul"
    return `<${tag}>${body}</${tag}>`
  }

  listitem(text: string): string {
    return `<li>${text}</li>`
  }

  blockquote(quote: string): string {
    return `<blockquote>${quote}</blockquote>`
  }

  code(code: string, _infostring: string | undefined, escaped: boolean): string {
    return `<pre><code>${escaped ? code : this.escape(code)}</code></pre>`
  }

  codespan(text: string): string {
    return `<code>${text}</code>`
  }

  br(): string {
    return "<br />"
  }

  private escape(code: string): string {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  del(text: string): string {
    return `<del>${text}</del>`
  }
}

const createParagraphFromHtml = (html: string): Paragraph[] => {
  const paragraphs: Paragraph[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const processNode = (node: ChildNode): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      let para: Paragraph

      if (element.tagName === "PRE") {
        const codeElement = element.querySelector("code")
        if (codeElement) {
          const codeText = codeElement.textContent || "" // Ensuring text content is not null
          para = new Paragraph({
            text: codeText.trim(),
            style: "MyCustomCode", // Custom style for code
          })
          paragraphs.push(para)
          return // Skip further processing to avoid treating code as list items
        }
      }

      // Process non-code elements
      const textContentTrimmed = element.textContent?.trim() ?? ""
      if (textContentTrimmed) {
        switch (element.tagName) {
          case "P":
            para = new Paragraph({
              text: textContentTrimmed,
              style: "MyCustomParagraph",
            })
            paragraphs.push(para)
            break
          case "STRONG":
            para = new Paragraph({
              children: [new TextRun({ text: textContentTrimmed, bold: true })],
              style: "MyCustomParagraph",
            })
            paragraphs.push(para)
            break
          case "EM":
            para = new Paragraph({
              children: [new TextRun({ text: textContentTrimmed, italics: true })],
              style: "MyCustomParagraph",
            })
            paragraphs.push(para)
            break
          case "LI":
            para = new Paragraph({
              children: [new TextRun({ text: textContentTrimmed })],
              bullet: { level: 0 },
              style: "MyCustomList",
            })
            paragraphs.push(para)
            break
          case "BLOCKQUOTE":
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: textContentTrimmed, bold: true })],
                indent: { left: 720 }, // This indentation might need adjustment based on your document's styling needs
              })
            )
            break
          // Add cases for H1-H6, OL, UL, BLOCKQUOTE as needed
          default:
            if (element.tagName.startsWith("H") && element.tagName.length === 2) {
              para = new Paragraph({
                text: textContentTrimmed,
                heading: HeadingLevel[`HEADING_${element.tagName.charAt(1)}` as keyof typeof HeadingLevel],
              })
              paragraphs.push(para)
            } else if (element.tagName === "OL" || element.tagName === "UL") {
              Array.from(element.children).forEach(child => processNode(child)) // Recursively process list items
            }
            break
        }
      }
    }
  }

  Array.from(doc.body.children).forEach(processNode) // Use children for direct child elements
  return paragraphs
}

export const convertMarkdownToWordDocument = async (
  messages: MessageType[],
  fileName: string,
  aiName: string,
  userName: string,
  chatThreadName: string
): Promise<void> => {
  const messageParagraphPromises = messages.map(async message => {
    const author = message.role === "system" || message.role === "assistant" ? aiName : userName
    const authorParagraph = new Paragraph({
      text: `${author}:`,
      heading: HeadingLevel.HEADING_2,
      style: "MyCustomHeading1",
    })

    const processedContent = processCitationsInText(message.content)
    const content = await marked.parse(processedContent)
    const contentParagraphs = createParagraphFromHtml(content)

    return [authorParagraph, ...contentParagraphs, new Paragraph({ style: "MyCustomParagraph" })]
  })

  await convertParagraphsToWordDocument(messageParagraphPromises, fileName, aiName, chatThreadName)
}

export const convertTranscriptionToWordDocument = async (
  transcriptions: string[],
  audioFileName: string,
  saveFileName: string,
  aiName: string,
  chatThreadName: string
): Promise<void> => {
  const messageParagraphPromises = transcriptions.map(async transcription => {
    const authorParagraph = new Paragraph({
      text: `${audioFileName}:`,
      heading: HeadingLevel.HEADING_2,
      style: "MyCustomHeading1",
    })

    const content = await marked.parse(transcription)
    const contentParagraphs = createParagraphFromHtml(content)

    return [authorParagraph, ...contentParagraphs, new Paragraph({ style: "MyCustomParagraph" })]
  })

  await convertParagraphsToWordDocument(messageParagraphPromises, saveFileName, aiName, chatThreadName)
}

const convertParagraphsToWordDocument = async (
  paragraphs: Promise<Paragraph[]>[],
  fileName: string,
  aiName: string,
  chatThreadName: string
): Promise<void> => {
  const renderer = new CustomRenderer()
  marked.use({ renderer })

  const coreProperties: IPropertiesOptions = {
    title: chatThreadName,
    subject: chatThreadName,
    creator: aiName,
    lastModifiedBy: aiName,
    numbering: numbering,
    sections: [],
  }

  const messageParagraphs = (await Promise.all(paragraphs)).flat()

  const doc = new Document({
    numbering: numbering,
    styles: customStyles,
    title: coreProperties.title,
    subject: coreProperties.subject,
    creator: coreProperties.creator,
    lastModifiedBy: coreProperties.lastModifiedBy,
    sections: [{ children: messageParagraphs }],
  })

  Packer.toBlob(doc)
    .then(blob => {
      saveAs(blob, fileName)
      showSuccess({
        title: "Success",
        description: "Chat exported to Word document",
      })
    })
    .catch(() => {
      showError("Failed to export chat to Word document")
    })
}

const processCitationsInText = (text: string): string => {
  const citationPattern = /{% citation[^\n]*/g
  const processedText = text.replace(citationPattern, "-- References were removed for privacy reasons --")
  return processedText
}
