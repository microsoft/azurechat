"use client"

import { CheckIcon, ClipboardIcon, ThumbsUp, ThumbsDown } from "lucide-react"
import React from "react"

import { Button } from "./button"
import { useWindowSize } from "./windowsize"

interface AssistantButtonsProps {
  isIconChecked: boolean
  thumbsUpClicked: boolean
  thumbsDownClicked: boolean
  handleCopyButton: () => void
  handleThumbsUpClick: () => void
  handleThumbsDownClick: () => void
}

export const AssistantButtons: React.FC<AssistantButtonsProps> = ({
  isIconChecked,
  thumbsUpClicked,
  thumbsDownClicked,
  handleCopyButton,
  handleThumbsUpClick,
  handleThumbsDownClick,
}) => {
  const { width } = useWindowSize()
  let iconSize = 10
  let buttonClass = "h-9"

  if (width < 768) {
    buttonClass = "h-7"
  } else if (width >= 768 && width < 1024) {
    iconSize = 12
  } else if (width >= 1024) {
    iconSize = 16
  }

  return (
    <div className="container flex w-full gap-4 p-2">
      <Button
        aria-label="Copy text"
        variant={"ghost"}
        size={"default"}
        className={buttonClass}
        title="Copy text"
        onClick={handleCopyButton}
      >
        {isIconChecked ? <CheckIcon size={iconSize} /> : <ClipboardIcon size={iconSize} />}
      </Button>

      <Button
        variant={"ghost"}
        size={"default"}
        className={buttonClass}
        title="Thumbs up"
        onClick={handleThumbsUpClick}
        aria-label="Provide positive feedback"
      >
        {thumbsUpClicked ? <CheckIcon size={iconSize} /> : <ThumbsUp size={iconSize} />}
      </Button>

      <Button
        variant={"ghost"}
        size={"default"}
        className={buttonClass}
        title="Thumbs down"
        onClick={handleThumbsDownClick}
        aria-label="Provide negative feedback"
      >
        {thumbsDownClicked ? <CheckIcon size={iconSize} /> : <ThumbsDown size={iconSize} />}
      </Button>
    </div>
  )
}

export default AssistantButtons
