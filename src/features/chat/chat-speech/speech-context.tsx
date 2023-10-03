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
  resetMicrophoneUsed: () => void;
  isMicrophoneUsed: boolean;
}

const SpeechContext = createContext<SpeechContextProps | null>(null);

export const SpeechProvider = ({ children }: { children: React.ReactNode }) => {
  const speechSynthesizer = useSpeechSynthesizer();
  const speechRecognizer = useSpeechRecognizer();

  return (
    <SpeechContext.Provider
      value={{
        ...speechSynthesizer,
        ...speechRecognizer,
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
