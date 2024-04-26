"use client"
import * as Tooltip from "@radix-ui/react-tooltip"
import { CheckIcon, ClipboardIcon, ThumbsUp, ThumbsDown, BookOpenText } from "lucide-react"
import React from "react"

import { Button } from "./button"
import { TooltipProvider } from "./tooltip-provider"
import { useWindowSize } from "./windowsize"

interface AssistantButtonsProps {
  isIconChecked: boolean
  thumbsUpClicked: boolean
  thumbsDownClicked: boolean
  handleCopyButton: () => void
  handleThumbsUpClick: () => void
  handleThumbsDownClick: () => void
}

interface FleschButtonProps {
  fleschScore: number
}

const useButtonStyles = () => {
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

  return { iconSize, buttonClass }
}

export const FleschButton: React.FC<FleschButtonProps> = ({ fleschScore }) => {
  const { iconSize } = useButtonStyles()

  return (
    <div className="container  relative flex w-full justify-end  gap-4 p-2">
      <TooltipProvider>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div className="flex items-center justify-center gap-2">
              <BookOpenText size={iconSize} />
              {fleschScore}
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content
            side="top"
            className="rounded-md bg-primary-foreground p-2 text-sm text-foreground shadow-lg"
          >
            <p>
              <strong>Readability:</strong> Flesch-Kincaid Score, based on sentence length and the syllables per word.
              <br /> Increasing score indicates greater difficulty in understanding the document.
              <br /> For example, a score of 8 implies comprehension by an eighth grader.
            </p>
          </Tooltip.Content>
        </Tooltip.Root>
      </TooltipProvider>
    </div>
  )
}

export const AssistantButtons: React.FC<AssistantButtonsProps> = ({
  isIconChecked,
  thumbsUpClicked,
  thumbsDownClicked,
  handleCopyButton,
  handleThumbsUpClick,
  handleThumbsDownClick,
}) => {
  const { iconSize, buttonClass } = useButtonStyles()
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
