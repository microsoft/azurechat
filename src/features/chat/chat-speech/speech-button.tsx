import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { FC, useRef, useState } from "react";
import { GetSpeechToken } from "./speech-service";

interface Prop {
  onSpeech: (text: string) => void;
  disabled: boolean;
}

export const SpeechButton: FC<Prop> = (props) => {
  const [isPressed, setIsPressed] = useState(false);

  const { startRecognition, stopRecognition } = useSpeechRecognizer({
    onSpeech: props.onSpeech,
  });

  const handleMouseDown = async () => {
    await startRecognition();
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    stopRecognition();
    setIsPressed(false);
  };

  return (
    <Button
      type="button"
      size="icon"
      variant={"ghost"}
      disabled={props.disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={isPressed ? "bg-red-400 hover:bg-red-400" : ""}
    >
      <Mic size={18} />
    </Button>
  );
};

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
