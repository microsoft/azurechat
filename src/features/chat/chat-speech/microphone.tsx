import { FC } from "react";
import { RecordSpeech } from "./record-speech";
import { useSpeechContext } from "./speech-context";
import { StopSpeech } from "./stop-speech";

interface MicrophoneProps {
  disabled: boolean;
}

export const Microphone: FC<MicrophoneProps> = (props) => {
  const { isPlaying } = useSpeechContext();
  return (
    <>
      {isPlaying ? (
        <StopSpeech disabled={props.disabled} />
      ) : (
        <RecordSpeech disabled={props.disabled} />
      )}
    </>
  );
};
