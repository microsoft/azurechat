import { FC } from "react";
import { useChatContext } from "../chat-context";
import { RecordSpeech } from "./record-speech";
import { StopSpeech } from "./stop-speech";

interface MicrophoneProps {
  disabled: boolean;
}

export const Microphone: FC<MicrophoneProps> = (props) => {
  const { speech } = useChatContext();
  return (
    <>
      {speech.isPlaying ? (
        <StopSpeech disabled={props.disabled} />
      ) : (
        <RecordSpeech disabled={props.disabled} />
      )}
    </>
  );
};
