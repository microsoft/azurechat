import { useState } from "react"

interface Props {
  buttonRef: React.RefObject<HTMLButtonElement>
}

interface UseChatInputDynamicHeightReturn {
  rows: number
  resetRows: () => void
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyUp: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export const useChatInputDynamicHeight = (props: Props): UseChatInputDynamicHeightReturn => {
  const maxRows = 5
  const [rows, setRows] = useState(1)
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set())

  const onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    keysPressed.delete(event.key)
    setKeysPressed(new Set([...keysPressed]))
  }

  const setRowsToMax = (rows: number): void => {
    if (rows < maxRows) {
      setRows(rows + 1)
    }
  }

  const resetRows = (): void => {
    setRows(1)
  }

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setRowsToMax(event.target.value.split("\n").length)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    setKeysPressed(keysPressed.add(event.key))

    if (keysPressed.has("Enter") && keysPressed.has("Shift")) {
      setRowsToMax(rows)
    }

    if (
      !event.nativeEvent.isComposing &&
      keysPressed.has("Enter") &&
      !keysPressed.has("Shift") &&
      props.buttonRef.current
    ) {
      props.buttonRef.current.click()
      event.preventDefault()
    }
  }

  return {
    rows,
    resetRows,
    onChange,
    onKeyDown,
    onKeyUp,
  }
}
