import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef } from "react";
import { GetSpeechToken } from "./speech-service";

export const useSpeechRecognizer = () => {
  const recognizerRef = useRef<SpeechRecognizer>();
  const onSpeechRef = useRef<(speech: string) => void>();

  const onSpeech = (onSpeech: (speech: string) => void) => {
    onSpeechRef.current = onSpeech;
  };

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
      if (onSpeechRef.current) {
        onSpeechRef.current(e.result.text);
      }
    };

    recognizer.startContinuousRecognitionAsync();
  };

  const stopRecognition = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
  };

  return { startRecognition, stopRecognition, onSpeech };
};
