import {
  AudioConfig,
  ResultReason,
  SpeakerAudioDestination,
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useRef, useState } from "react";
import { GetSpeechToken } from "./speech-service";

export const useSpeechSynthesizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<SpeakerAudioDestination>();

  const stopPlaying = () => {
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.pause();
    }
  };

  const textToSpeech = async (textToSpeak: string) => {
    if (isPlaying) {
      stopPlaying();
    }

    const tokenObj = await GetSpeechToken();
    const speechConfig = SpeechConfig.fromAuthorizationToken(
      tokenObj.token,
      tokenObj.region
    );
    playerRef.current = new SpeakerAudioDestination();

    var audioConfig = AudioConfig.fromSpeakerOutput(playerRef.current);
    let synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

    playerRef.current.onAudioEnd = () => {
      setIsPlaying(false);
    };

    synthesizer.speakTextAsync(
      textToSpeak,
      (result) => {
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
          setIsPlaying(true);
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails);
          setIsPlaying(false);
        }
        synthesizer.close();
      },
      function (err) {
        console.log("err - " + err);
        synthesizer.close();
      }
    );
  };

  return { stopPlaying, textToSpeech, isPlaying };
};
