const chunkSize = 1000
const chunkOverlap = 200

export function chunkDocumentWithOverlap(document: string): string[] {
  const chunks: string[] = []

  if (document.length <= chunkSize) {
    chunks.push(document)
    return chunks
  }

  let startIndex = 0

  while (startIndex < document.length) {
    const endIndex = startIndex + chunkSize
    const chunk = document.substring(startIndex, endIndex)
    chunks.push(chunk)
    startIndex = endIndex - chunkOverlap
  }

  return chunks
}
