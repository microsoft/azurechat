import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk"
import { useRef, useState } from "react"
import { GetSpeechToken } from "./speech-service"

export interface SpeechToTextProps {
  startRecognition: () => void
  stopRecognition: () => void
  isMicrophoneUsed: boolean
  resetMicrophoneUsed: () => void
  isMicrophonePressed: boolean
}

interface Props {
  onSpeech: (value: string) => void
}

export const useSpeechToText = (props: Props): SpeechToTextProps => {
  const recognizerRef = useRef<SpeechRecognizer>()

  const [isMicrophoneUsed, setIsMicrophoneUsed] = useState(false)
  const [isMicrophonePressed, setIsMicrophonePressed] = useState(false)

  const { showError } = useGlobalMessageContext()

  const startRecognition = async (): Promise<void> => {
    const token = await GetSpeechToken()
    const apimUrl = new URL(token.sttUrl)

    if (token.error) {
      showError(token.errorMessage)
      return
    }

    setIsMicrophoneUsed(true)
    setIsMicrophonePressed(true)
    const speechConfig = SpeechConfig.fromEndpoint(apimUrl, token.apimKey)

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput()

    const autoDetectSourceLanguageConfig = AutoDetectSourceLanguageConfig.fromLanguages(["en-US"])

    const recognizer = SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig)

    recognizerRef.current = recognizer

    recognizer.recognizing = (_s, e) => {
      props.onSpeech(e.result.text)
    }

    recognizer.canceled = (_s, e) => {
      showError(e.errorDetails)
    }

    recognizer.startContinuousRecognitionAsync()
  }

  const stopRecognition = (): void => {
    recognizerRef.current?.stopContinuousRecognitionAsync()
    setIsMicrophonePressed(false)
  }

  const resetMicrophoneUsed = (): void => {
    setIsMicrophoneUsed(false)
  }

  return {
    startRecognition,
    stopRecognition,
    isMicrophoneUsed,
    resetMicrophoneUsed,
    isMicrophonePressed,
  }
}
