import { useState } from "react";

interface Props {
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const useChatInputDynamicHeight = (props: Props) => {
  const maxRows = 6;
  const [rows, setRows] = useState(1);

  const [keysPressed, setKeysPressed] = useState(new Set());

  const onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    keysPressed.delete(event.key);
    setKeysPressed(keysPressed);
  };

  const setRowsToMax = (rows: number) => {
    if (rows < maxRows) {
      setRows(rows + 1);
    }
  };

  const resetRows = () => {
    setRows(1);
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRowsToMax(event.target.value.split("\n").length - 1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setKeysPressed(keysPressed.add(event.key));

    if (keysPressed.has("Enter") && keysPressed.has("Shift")) {
      setRowsToMax(rows + 1);
    }

    if (
      !event.nativeEvent.isComposing &&
      keysPressed.has("Enter") &&
      !keysPressed.has("Shift") &&
      props.buttonRef.current
    ) {
      props.buttonRef.current.click();
      event.preventDefault();
    }
  };

  return {
    rows,
    resetRows,
    onChange,
    onKeyDown,
    onKeyUp,
  };
};
