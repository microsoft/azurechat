import { Paragraph, TextRun, HeadingLevel } from "docx"

export const createParagraphFromHtml = (html: string): Paragraph[] => {
  const paragraphs: Paragraph[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const processNode = (node: ChildNode): void => {
    if (node.textContent && node.textContent.trim() !== "") {
      switch (node.nodeName) {
        case "P":
          paragraphs.push(new Paragraph(node.textContent.trim()))
          break
        case "STRONG":
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: node.textContent.trim(), bold: true })],
            })
          )
          break
        case "EM":
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: node.textContent.trim(), italics: true })],
            })
          )
          break
        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6":
          paragraphs.push(
            new Paragraph({
              text: node.textContent.trim(),
              heading: HeadingLevel[`HEADING_${node.nodeName.charAt(1)}` as keyof typeof HeadingLevel],
            })
          )
          break
        case "UL":
        case "OL":
          node.childNodes.forEach(li => processNode(li))
          break
        case "BLOCKQUOTE":
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: node.textContent.trim(),
                  italics: true,
                }),
              ],
              indent: { left: 720 },
            })
          )
          break
        case "LI":
          paragraphs.push(
            new Paragraph({
              text: node.textContent.trim(),
              bullet: { level: 0 },
            })
          )
          break
      }
    }
  }

  doc.body.childNodes.forEach(processNode)
  return paragraphs
}

export const processCitationsInText = (text: string): string => {
  const citationPattern = /{% citation[^\n]*/g
  return text.replace(citationPattern, "-- References were removed for privacy reasons --")
}
