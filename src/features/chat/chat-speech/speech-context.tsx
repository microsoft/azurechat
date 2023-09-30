import React, { createContext } from "react";
import { useSpeechRecognizer } from "./use-speech-recognizer";
import { useSpeechSynthesizer } from "./use-speech-synthesizer";

interface SpeechContextProps {
  textToSpeech: (textToSpeak: string) => Promise<void>;
  stopPlaying: () => void;
  isPlaying: boolean;
  startRecognition: () => void;
  stopRecognition: () => void;
  onSpeech: (onSpeech: (speech: string) => void) => void;
}

const SpeechContext = createContext<SpeechContextProps | null>(null);

export const SpeechProvider = ({ children }: { children: React.ReactNode }) => {
  const { isPlaying, stopPlaying, textToSpeech } = useSpeechSynthesizer();
  const { startRecognition, stopRecognition, onSpeech } = useSpeechRecognizer();

  return (
    <SpeechContext.Provider
      value={{
        textToSpeech,
        stopPlaying,
        isPlaying,
        startRecognition,
        stopRecognition,
        onSpeech,
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
