import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef, useState } from "react";
import { GetSpeechToken } from "./speech-service";

export const useSpeechRecognizer = () => {
  const recognizerRef = useRef<SpeechRecognizer>();

  const [speech, setSpeech] = useState("");

  const startRecognition = async () => {
    const token = await GetSpeechToken();

    if (!token.error) {
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
        setSpeech(e.result.text);
      };

      recognizer.canceled = (s, e) => {
        console.log(e.errorDetails);
      };

      recognizer.startContinuousRecognitionAsync();
    }
  };

  const setSpeechText = (text: string) => {
    setSpeech(text);
  };

  const stopRecognition = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync();
  };

  return { startRecognition, stopRecognition, speech, setSpeechText };
};
