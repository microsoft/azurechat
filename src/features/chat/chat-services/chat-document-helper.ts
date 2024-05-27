"use server"
import "server-only"
import { AnalyzeResult } from "@azure/ai-form-recognizer"

export async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const binary = new Uint8Array(buffer)
  let base64String = ""
  for (let i = 0; i < binary.length; i++) {
    base64String += String.fromCharCode(binary[i])
  }
  return await Promise.resolve(btoa(base64String))
}

type DocumentIntelligenceObject = {
  analyzeDocumentUrl: string
  analyzeResultUrl: string
  diHeaders: {
    "Content-Type": string
    "api-key": string
  }
}
const customDocumentIntelligenceObject = (modelId?: string, resultId?: string): DocumentIntelligenceObject => {
  const apiVersion = "2023-07-31"
  const analyzeDocumentUrl = `${process.env.APIM_BASE}/formrecognizer/documentModels/${modelId}:analyze?api-version=${apiVersion}&locale=en-GB`
  const analyzeResultUrl = `${process.env.APIM_BASE}/formrecognizer/documentModels/${modelId}/analyzeResults/${resultId}?api-version=${apiVersion}`
  const diHeaders = {
    "Content-Type": "application/json",
    "api-key": process.env.APIM_KEY,
  }

  return {
    analyzeDocumentUrl,
    analyzeResultUrl,
    diHeaders,
  }
}

export async function customBeginAnalyzeDocument(
  modelId: string,
  source: string,
  sourceType: "base64" | "url"
): Promise<AnalyzeResult | undefined> {
  const diParam = customDocumentIntelligenceObject(modelId)
  const analyzeDocumentUrl = diParam.analyzeDocumentUrl
  const analyzeDocumentHeaders = diParam.diHeaders
  const analyzeDocumentBody = sourceType === "base64" ? { base64Source: source } : { urlSource: source }

  const response = await fetch(analyzeDocumentUrl, {
    method: "POST",
    headers: analyzeDocumentHeaders,
    body: JSON.stringify(analyzeDocumentBody),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to analyze document. ${response.statusText}`)
  }

  const resultId = response.headers.get("apim-request-id")

  if (resultId) {
    return await customGetAnalyzeResult(modelId, resultId)
  }

  throw new Error(`Failed to get Result ID. Status: ${response.status}`)
}

async function customGetAnalyzeResult(modelId: string, resultId: string): Promise<AnalyzeResult | undefined> {
  const diParam = customDocumentIntelligenceObject(modelId, resultId)
  const analyzeResultUrl = diParam.analyzeResultUrl
  if (!analyzeResultUrl) {
    throw new Error("analyzeResultUrl is undefined")
  }
  const analyzeDocumentHeaders = diParam.diHeaders

  try {
    let operationStatus: string = ""
    let analyzedResult: AnalyzeResult | undefined

    while (!operationStatus || operationStatus !== "succeeded") {
      const response = await fetch(analyzeResultUrl, {
        method: "GET",
        headers: analyzeDocumentHeaders,
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Failed to fetch result." + (await response.json()))

      const responseBody = await response.json()

      operationStatus = responseBody.status

      if (operationStatus === "succeeded") {
        analyzedResult = responseBody.analyzeResult
        break
      }

      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    return analyzedResult
  } catch (e) {
    console.error(e)
    throw e
  }
}
