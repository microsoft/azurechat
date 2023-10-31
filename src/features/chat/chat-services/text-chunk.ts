const chunkSize = 1000;
const chunkOverlap = 200;

export function chunkDocumentWithOverlap(document: string): string[] {
  const chunks: string[] = [];

  if (document.length <= chunkSize) {
    // If the document is smaller than the desired chunk size, return it as a single chunk.
    chunks.push(document);
    return chunks;
  }

  let startIndex = 0;

  // Split the document into chunks of the desired size, with overlap.
  while (startIndex < document.length) {
    const endIndex = startIndex + chunkSize;
    const chunk = document.substring(startIndex, endIndex);
    chunks.push(chunk);
    startIndex = endIndex - chunkOverlap;
  }

  return chunks;
}
