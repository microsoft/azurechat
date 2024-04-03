import createClient, { ErrorResponseOutput, TranslatedTextItemOutput } from "@azure-rest/ai-translation-text"

import { ServerActionResponseAsync } from "@/features/common/server-action-response"

export function getBooleanEnv(variable: string): boolean {
  return process.env[variable]?.toLowerCase() === "true"
}

export async function translator(input: string): ServerActionResponseAsync<string> {
  if (!getBooleanEnv("NEXT_PUBLIC_FEATURE_TRANSLATOR") || typeof input !== "string")
    return { status: "OK", response: input }

  const codeBlockPattern = /(```[\s\S]*?```)/g
  const codeBlocks: string[] = []
  let i = 0

  const processedText = input.replace(codeBlockPattern, match => {
    codeBlocks.push(match)
    return `__codeblock_${i++}__`
  })

  try {
    const translatedTexts = await translateFunction([{ text: processedText.toLowerCase() }], "en-GB", "en-US")
    let result = translatedTexts.length <= 0 ? processedText : revertCase(processedText, translatedTexts[0])

    codeBlocks.forEach((codeBlock, index) => {
      result = result.replace(`__codeblock_${index}__`, codeBlock)
    })

    return { status: "OK", response: result }
  } catch (error) {
    console.error(error)
    return { status: "ERROR", errors: [{ message: "Translation failed" }] }
  }
}

async function translateFunction(
  inputText: { text: string }[],
  translatedTo: string,
  translatedFrom: string
): Promise<string[]> {
  const apiKey = process.env.AZURE_TRANSLATOR_KEY
  const endpoint = process.env.AZURE_TRANSLATOR_URL
  const region = process.env.AZURE_SPEECH_REGION

  if (!apiKey || !endpoint || !region) {
    throw new Error("Missing configuration for Azure Translator.")
  }

  const translateCredential = { key: apiKey, region }
  const translationClient = createClient(endpoint, translateCredential)

  const translateResponse = await translationClient.path("/translate").post({
    body: inputText,
    queryParameters: { to: translatedTo, from: translatedFrom },
    headers: { "api-key": apiKey },
  })

  const translations = translateResponse.body as TranslatedTextItemOutput[] | ErrorResponseOutput

  if (Array.isArray(translations)) {
    return translations.map(translation => translation.translations[0].text)
  } else {
    throw new Error("Translation API returned an error response.")
  }
}

function revertCase(originalText: string, translatedText: string): string {
  const originalWords = originalText.split(" ")
  const translatedWords = translatedText.split(" ")

  return originalWords
    .map((originalWord, i) => {
      const translatedWord = translatedWords[i] || ""
      return [...translatedWord]
        .map((char, index) =>
          index < originalWord.length && originalWord.charAt(index).match(/[A-Z]/) ? char.toUpperCase() : char
        )
        .join("")
    })
    .join(" ")
}
