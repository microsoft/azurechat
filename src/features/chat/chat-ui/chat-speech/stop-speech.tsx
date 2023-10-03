import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { FC } from "react";
import { useChatContext } from "../chat-context";

interface StopButtonProps {
  disabled: boolean;
}

export const StopSpeech: FC<StopButtonProps> = (props) => {
  const { speech } = useChatContext();
  return (
    <Button
      disabled={props.disabled}
      onClick={speech.stopPlaying}
      type="button"
      size="icon"
      variant={"ghost"}
    >
      <Square size={18} />
    </Button>
  );
};
