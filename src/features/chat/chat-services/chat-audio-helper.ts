"use server"
import "server-only"

import logger from "@/features/insights/app-insights"

import { arrayBufferToBase64 } from "./chat-document-helper"

export const transcribeAudio = async (
  formData: FormData
): Promise<{
  vtt: string
  text: string
}> => {
  logger.warning("transcribing file using whisper")

  const AZURE_ML_MANAGED_ERROR_CODE = 424
  // const AZURE_ML_TIMEOUT_ERROR_CODE = 408
  const file = formData.get("audio") as File

  const apiUrl = process.env.APIM_BASE + "/whisper"
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "api-key": process.env.APIM_KEY!,
    },
    body: JSON.stringify({
      audio: await arrayBufferToBase64(await file.arrayBuffer()),
      action: "transcribe",
      language: "en",
      format: "vtt",
      hallucination_silence_threshold: 2,
      beam_size: 1,
    }),
  })

  if (response.ok || response.status === AZURE_ML_MANAGED_ERROR_CODE) {
    const body = (await response.json()) as WhisperResponse

    if (response.ok) {
      return {
        vtt: body.transcription!,
        text: body.transcription_txt!,
      }
    }

    logger.error("whisper response error " + body)
    throw body
  }

  const text = await response.text()
  logger.error("whisper error " + text)

  throw text
}

interface WhisperResponse {
  audio?: string
  transcription?: string
  transcription_txt?: string
  error?: string
  ffmpeg_error?: string
}
