import { syllable } from "syllable"

function countWords(text: string): number {
  return text.match(/\w+/g)?.length || 0
}

function countSentences(text: string): number {
  return text.match(/[.!?]+(\s|$)/g)?.length || 0
}

/**
 * Flesch-Kincaid Grade Level test
 * @param text
 * @returns This test rates text on a U.S. school grade level.
 * Returns -1 if the score couldn't be calcultated
 */
export function calculateFleschKincaidScore(text: string): number {
  try {
    const words = countWords(text)
    const sentences = countSentences(text)
    const syllables = syllable(text)

    if (words === 0 || sentences === 0) {
      return 1
    }

    let fleschKincaidScore = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59

    fleschKincaidScore = Math.max(1, fleschKincaidScore)

    return Math.round(fleschKincaidScore)
  } catch (error) {
    // TODO handle error
    console.error("Error calculating Flesch-Kincaid score:", error)
    return -1
  }
}
