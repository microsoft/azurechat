import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef } from "react";
import { GetSpeechToken } from "./speech-service";

interface SpeechRecognizerProps {
  onSpeech: (text: string) => void;
}

export const useSpeechRecognizer = (props: SpeechRecognizerProps) => {
  const recognizerRef = useRef<SpeechRecognizer>();

  const startRecognition = async () => {
    const token = await GetSpeechToken();
    console.log(token);
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

    recognizer.startContinuousRecognitionAsync();
  };

  const stopRecognition = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
  };

  return { startRecognition, stopRecognition };
};
