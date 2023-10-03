import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { FC } from "react";
import { useSpeechContext } from "./speech-context";

interface StopButtonProps {
  disabled: boolean;
}

export const StopSpeech: FC<StopButtonProps> = (props) => {
  const { stopPlaying } = useSpeechContext();
  return (
    <Button
      disabled={props.disabled}
      onClick={stopPlaying}
      type="button"
      size="icon"
      variant={"ghost"}
    >
      <Square size={18} />
    </Button>
  );
};
