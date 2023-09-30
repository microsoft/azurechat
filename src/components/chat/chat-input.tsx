import { Microphone } from "@/features/chat/chat-speech/microphone";
import { useSpeechContext } from "@/features/chat/chat-speech/speech-context";
import { Loader, Send } from "lucide-react";
import { FC, FormEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface Props {
  value: string;
  setInput: (value: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const ChatInput: FC<Props> = (props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  const maxRows = 6;

  const [keysPressed, setKeysPressed] = useState(new Set());

  const { onSpeech } = useSpeechContext();

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setKeysPressed(keysPressed.add(event.key));

    if (keysPressed.has("Enter") && keysPressed.has("Shift")) {
      setRowsToMax(rows + 1);
    }

    if (
      !event.nativeEvent.isComposing &&
      keysPressed.has("Enter") &&
      !keysPressed.has("Shift") &&
      buttonRef.current
    ) {
      buttonRef.current.click();
      event.preventDefault();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.handleSubmit(e);
    setRows(1);
  };

  const onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    keysPressed.delete(event.key);
    setKeysPressed(keysPressed);
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRowsToMax(event.target.value.split("\n").length - 1);
    props.setInput(event.target.value);
  };

  const setRowsToMax = (rows: number) => {
    if (rows < maxRows) {
      setRows(rows + 1);
    }
  };

  onSpeech((text) => {
    textAreaRef.current!.value = text;
    props.setInput(text);
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0 w-full flex items-center"
    >
      <div className="container mx-auto max-w-4xl relative py-2 flex gap-2 items-end">
        <Textarea
          ref={textAreaRef}
          rows={rows}
          placeholder="Send a message"
          className="min-h-fit bg-background shadow-sm resize-none py-4"
          value={props.value}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onChange={onChange}
        ></Textarea>
        <div className="absolute right-0 bottom-0 px-8 flex items-end h-full mr-2 mb-4">
          <Microphone disabled={props.isLoading} />
          <Button
            size="icon"
            type="submit"
            variant={"ghost"}
            ref={buttonRef}
            disabled={props.isLoading}
          >
            {props.isLoading ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
