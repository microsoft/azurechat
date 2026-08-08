import { showError } from "@/features/globals/global-message-store";
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { proxy, useSnapshot } from "valtio";
import { chatStore } from "../../chat-store";
import { GetSpeechToken } from "./speech-service";

let speechRecognizer: SpeechRecognizer | undefined = undefined;

class SpeechToText {
  public isMicrophoneUsed: boolean = false;
  public isMicrophoneReady: boolean = false;

  public async startRecognition() {
    const token = await GetSpeechToken();

    if (token.error) {
      showError(token.errorMessage);
      return;
    }

    this.isMicrophoneReady = true;
    this.isMicrophoneUsed = true;

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

    speechRecognizer = recognizer;

    recognizer.recognizing = (s, e) => {
      chatStore.updateInput(e.result.text);
    };

    recognizer.canceled = (s, e) => {
      showError(e.errorDetails);
    };

    recognizer.startContinuousRecognitionAsync();
  }

  public stopRecognition() {
    if (speechRecognizer) {
      speechRecognizer.stopContinuousRecognitionAsync();
      this.isMicrophoneReady = false;
    }
  }

  public userDidUseMicrophone() {
    return this.isMicrophoneUsed;
  }

  public resetMicrophoneUsed() {
    this.isMicrophoneUsed = false;
  }
}
export const speechToTextStore = proxy(new SpeechToText());

export const useSpeechToText = () => {
  return useSnapshot(speechToTextStore);
};
