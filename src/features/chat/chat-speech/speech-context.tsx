import React, { createContext } from "react";
import { useSpeechRecognizer } from "./use-speech-recognizer";
import { useSpeechSynthesizer } from "./use-speech-synthesizer";

interface SpeechContextProps {
  textToSpeech: (textToSpeak: string) => Promise<void>;
  stopPlaying: () => void;
  isPlaying: boolean;
  startRecognition: () => void;
  stopRecognition: () => void;
  speech: string;
  setSpeechText: (text: string) => void;
}

const SpeechContext = createContext<SpeechContextProps | null>(null);

export const SpeechProvider = ({ children }: { children: React.ReactNode }) => {
  const { isPlaying, stopPlaying, textToSpeech } = useSpeechSynthesizer();
  const { startRecognition, stopRecognition, speech, setSpeechText } =
    useSpeechRecognizer();

  return (
    <SpeechContext.Provider
      value={{
        textToSpeech,
        stopPlaying,
        isPlaying,
        startRecognition,
        stopRecognition,
        speech,
        setSpeechText,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeechContext = () => {
  const context = React.useContext(SpeechContext);
  if (!context) {
    throw new Error("SpeechContext is null");
  }

  return context;
};
