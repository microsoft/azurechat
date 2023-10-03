import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef, useState } from "react";
import { GetSpeechToken } from "./speech-service";

export interface SpeechToTextProps {
  startRecognition: () => void;
  stopRecognition: () => void;
  isMicrophoneUsed: boolean;
  resetMicrophoneUsed: () => void;
  isMicrophonePressed: boolean;
}

interface Props {
  onSpeech: (value: string) => void;
}

export const useSpeechToText = (props: Props): SpeechToTextProps => {
  const recognizerRef = useRef<SpeechRecognizer>();

  const [isMicrophoneUsed, setIsMicrophoneUsed] = useState(false);
  const [isMicrophonePressed, setIsMicrophonePressed] = useState(false);

  const { showError } = useGlobalMessageContext();

  const startRecognition = async () => {
    const token = await GetSpeechToken();

    if (token.error) {
      showError(token.errorMessage);
      return;
    }

    setIsMicrophoneUsed(true);
    setIsMicrophonePressed(true);
    const speechConfig = SpeechConfig.fromAuthorizationToken(
      token.token,
      token.region
    );

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    const autoDetectSourceLanguageConfig =
      AutoDetectSourceLanguageConfig.fromLanguages([
        "en-US",
        "zh-CN",
        "it-IT",
        "pt-BR",
      ]);

    const recognizer = SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig
    );

    recognizerRef.current = recognizer;

    recognizer.recognizing = (s, e) => {
      props.onSpeech(e.result.text);
    };

    recognizer.canceled = (s, e) => {
      showError(e.errorDetails);
    };

    recognizer.startContinuousRecognitionAsync();
  };

  const stopRecognition = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
    setIsMicrophonePressed(false);
  };

  const resetMicrophoneUsed = () => {
    setIsMicrophoneUsed(false);
  };

  return {
    startRecognition,
    stopRecognition,
    isMicrophoneUsed,
    resetMicrophoneUsed,
    isMicrophonePressed,
  };
};
