import { diffWords } from "diff"

export const calculateAccuracy = (originalContent: string, updatedContents: string): number => {
  const normalize = (str: string): string => str.trim().replace(/\s+/g, " ")
  const normalizedOriginal = normalize(originalContent)
  const normalizedUpdated = normalize(
    updatedContents
      .replace(/\[(.*?)\]/g, "")
      .replace(/\((.*?)\)/g, "")
      .replace(/(.*?):/, "")
  )

  if (normalizedOriginal === normalizedUpdated) return 100

  const originalWords = normalizedOriginal.split(/\s+/).length
  const diff = diffWords(normalizedOriginal, normalizedUpdated)
  const changedWords = diff
    .filter(part => part.added || part.removed)
    .reduce((acc, part) => acc + part.value.split(/\s+/).length, 0)

  return Number((((originalWords - changedWords) / originalWords) * 100).toFixed(2))
}
