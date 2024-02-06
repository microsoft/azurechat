import { Mic, Square } from "lucide-react";
import { Button } from "../../button";

export const Microphone = (props: {
  isPlaying: boolean;
  isMicrophoneReady: boolean;
  stopPlaying: () => void;
  startRecognition: () => void;
  stopRecognition: () => void;
}) => {
  const startRecognition = () => {
    props.startRecognition();
  };

  const stopRecognition = () => {
    props.stopRecognition();
  };

  return (
    <>
      {props.isPlaying ? (
        <Button
          size="icon"
          type="button"
          variant={"ghost"}
          onClick={props.stopPlaying}
        >
          <Square size={16} />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          variant={"ghost"}
          onMouseDown={startRecognition}
          onMouseUp={stopRecognition}
          onMouseLeave={stopRecognition}
          className={
            props.isMicrophoneReady ? "bg-red-400 hover:bg-red-400" : ""
          }
        >
          <Mic size={16} />
        </Button>
      )}
    </>
  );
};
