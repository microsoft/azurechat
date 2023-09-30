import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { FC, useState } from "react";
import { useSpeechRecognizer } from "./use-speech-recognizer";

interface Prop {
  onSpeech: (text: string) => void;
  disabled: boolean;
}

export const RecordSpeech: FC<Prop> = (props) => {
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
