"use server"
import "server-only"
import {
  AudioConfig,
  SpeechRecognitionResult,
  CancellationDetails,
  CancellationReason,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
  AudioInputStream,
  ProfanityOption,
  OutputFormat,
} from "microsoft-cognitiveservices-speech-sdk"
import { FileAudioSource } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/FileAudioSource"
import { AudioOutputFormatImpl } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioOutputFormat"

import { GetSpeechToken } from "@/features/chat/chat-ui/chat-speech/speech-service"
import logger from "@/features/insights/app-insights"

import { arrayBufferToBase64 } from "./chat-document-helper"

export const speechToTextRecognizeOnce = async (
  formData: FormData
): Promise<{
  vtt: string
  text: string
}> => {
  const speechToken = await GetSpeechToken()
  const apimUrl = new URL(speechToken.sttUrl)

  const speechConfig = SpeechConfig.fromEndpoint(apimUrl)
  speechConfig.speechRecognitionLanguage = "en-GB"
  speechConfig.authorizationToken = speechToken.token

  speechConfig.outputFormat = OutputFormat.Detailed
  speechConfig.setProfanity(ProfanityOption.Raw)
  speechConfig.setProperty("SpeechServiceResponse_PostProcessingOption", "TrueText")
  speechConfig.setProperty("SpeechServiceResponse_StablePartialResultThreshold", "5")

  const file: File | null = formData.get("audio") as unknown as File

  const audioConfig = await audioConfigFromFile(file)
  if (speechToken.error) throw speechToken.errorMessage

  const recognizer = new SpeechRecognizer(speechConfig, audioConfig)

  const result = await startRecognition(recognizer)
  return result
}

export const transcribeAudio = async (
  formData: FormData
): Promise<{
  vtt: string
  text: string
}> => {
  logger.warning("transcribing audio using whisper")

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

async function _recognizeOnceFromFile(recognizer: SpeechRecognizer): Promise<string> {
  try {
    let recognisedText = ""

    const result = await new Promise<SpeechRecognitionResult>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (res: SpeechRecognitionResult) => resolve(res),
        (err: unknown) => reject(err)
      )
    })

    if (result) {
      switch (result.reason) {
        case ResultReason.RecognizedSpeech:
          recognisedText = result.text
          break
        case ResultReason.NoMatch:
          break
        case ResultReason.Canceled:
          handleCanceledReason(result)
          break
      }
    }
    recognizer.close()

    return recognisedText
  } catch (e) {
    logger.error("Error in speech recognition", { error: e instanceof Error ? e.message : e })
    return ""
  }
}

const handleCanceledReason = (result: SpeechRecognitionResult): void => {
  const cancellation = CancellationDetails.fromResult(result)
  if (cancellation.reason === CancellationReason.Error)
    logger.error("Speech recognition cancellation error", { cancellation })
  else logger.event("Speech recognition cancellation", { cancellation })
}

/**
 * The event recognised signals that a final recognition result is received.
 */
async function startRecognition(recognizer: SpeechRecognizer): Promise<{
  vtt: string
  text: string
}> {
  const texts: string[] = []
  const vtt: string[] = []

  vtt.push("WEBVTT")
  vtt.push("")

  await new Promise<string[]>((resolve, _reject) => {
    recognizer.recognized = (_s, e) => {
      if (e.result.reason == ResultReason.RecognizedSpeech && e.result.text.length > 0) {
        const ticksPerMillisecond = 10000
        const startTime = new Date(e.result.offset / ticksPerMillisecond)
        const endTime = new Date(e.result.offset / ticksPerMillisecond + e.result.duration / ticksPerMillisecond)
        const start_hours = startTime.getUTCHours().toString().padStart(2, "0")
        const start_minutes = startTime.getUTCMinutes().toString().padStart(2, "0")
        const start_seconds = startTime.getUTCSeconds().toString().padStart(2, "0")
        const start_milliseconds = startTime.getUTCMilliseconds().toString().padStart(3, "0")
        const end_hours = endTime.getUTCHours().toString().padStart(2, "0")
        const end_minutes = endTime.getUTCMinutes().toString().padStart(2, "0")
        const end_seconds = endTime.getUTCSeconds().toString().padStart(2, "0")
        const end_milliseconds = endTime.getUTCMilliseconds().toString().padStart(3, "0")

        vtt.push(
          `${start_hours}:${start_minutes}:${start_seconds}.${start_milliseconds} --> ${end_hours}:${end_minutes}:${end_seconds}.${end_milliseconds}`
        )
        vtt.push(`${e.result.text}`)
        vtt.push("")

        texts.push(e.result.text)
      }
    }

    recognizer.canceled = (_s, _e) => {
      resolve(texts)
    }

    recognizer.startContinuousRecognitionAsync()
  })

  return {
    vtt: vtt.join("\n"),
    text: texts.join("\n"),
  }
}

/**
 * Initialise audio configurations from file
 */
const audioConfigFromFile = async (file: File): Promise<AudioConfig> => {
  try {
    // Create Buffer
    const base64String = await arrayBufferToBase64(await file.arrayBuffer())
    const buffer = Buffer.from(base64String, "base64")

    // Audio Configurations
    const audioConfig = AudioConfig.fromWavFileInput(buffer, file.name)

    //File Audio Source - Throw error if wav is corrupted or not readable
    const audioSource = new FileAudioSource(buffer, file.name)
    ;(await audioSource.format).formatTag

    return audioConfig
  } catch (e) {
    throw new Error("Unsupported audio file. " + e)
  }
}

/**
 * Initialise audio configurations from Stream
 */
const _audioConfigFromStream = async (file: File): Promise<AudioConfig> => {
  try {
    // Get Default Format
    const audioFormat = AudioOutputFormatImpl.getDefaultInputFormat()

    // Create Stream
    const arrayBuffer = await file.arrayBuffer()
    const pushStream = AudioInputStream.createPushStream(audioFormat)
    pushStream.write(arrayBuffer)

    // Init Audio Config
    const audioConfig = AudioConfig.fromStreamInput(pushStream)

    return audioConfig
  } catch (e) {
    logger.error("Unsupported audio file", { error: e instanceof Error ? e.message : e })
    throw e
  }
}

interface WhisperResponse {
  audio?: string
  transcription?: string
  transcription_txt?: string
  error?: string
  ffmpeg_error?: string
}
