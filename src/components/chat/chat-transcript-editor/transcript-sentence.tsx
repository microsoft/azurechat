"use client"

import { Field, Control } from "@radix-ui/react-form"
import { ArrowUp, ArrowDown, Pencil } from "lucide-react"
import { useState, useCallback } from "react"

import { Button } from "@/features/ui/button"
import { Textarea } from "@/features/ui/textarea"

import { Sentence, Speaker } from "./types"

type SentenceProps = {
  id: string
  sentence: Sentence
  speaker: Speaker
  onChange: (sentence: Sentence) => void
  onMergeUp?: () => void
  onMergeDown?: () => void
}

export const TranscriptSentence = ({
  sentence,
  speaker,
  onChange,
  onMergeUp,
  onMergeDown,
}: SentenceProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = useCallback(
    (newSentence: string): void => {
      setIsEditing(false)
      onChange({ ...sentence, line: newSentence })
    },
    [onChange, sentence]
  )

  const switchToEdit = useCallback((): void => setIsEditing(prev => !prev), [])

  return (
    <div
      className={`${speaker?.background} group flex cursor-pointer items-start gap-2 rounded-sm border-2 border-transparent p-2 hover:border-accent`}
    >
      {isEditing ? (
        <SentenceForm id={sentence.id} line={sentence.line} onChange={handleChange} />
      ) : (
        <SentenceDisplay
          sentence={sentence}
          speaker={speaker}
          onMergeDown={onMergeDown}
          onMergeUp={onMergeUp}
          switchToEdit={switchToEdit}
        />
      )}
    </div>
  )
}

type SentenceDisplayProps = {
  sentence: Sentence
  speaker?: Speaker
  switchToEdit: () => void
  onMergeUp?: () => void
  onMergeDown?: () => void
}

const SentenceDisplay = ({
  sentence,
  speaker,
  onMergeDown,
  onMergeUp,
  switchToEdit,
}: SentenceDisplayProps): JSX.Element => {
  const { line } = sentence

  const handleMergeUp = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    if (onMergeUp) {
      onMergeUp()
    }
  }

  const handleMergeDown = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    if (onMergeDown) {
      onMergeDown()
    }
  }

  const handleSwitchToEdit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    switchToEdit()
  }
  return (
    <>
      <div className={`flex flex-col ${speaker ? "gap-1" : ""}`}>
        {speaker && <b className="text-nowrap">{speaker.name}</b>}
        <div className="grid grid-cols-3 gap-1">
          {onMergeUp && (
            <Button
              role="button"
              className="col-start-1 opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel="Merge Up"
              onClick={handleMergeUp}
              type="button"
            >
              <ArrowUp size={16} />
            </Button>
          )}
          <Button
            role="button"
            className="col-start-2 opacity-20 group-hover:opacity-100"
            size="sm"
            variant="accent"
            ariaLabel="Edit"
            onClick={handleSwitchToEdit}
            type="button"
          >
            <Pencil size={16} />
          </Button>
          {onMergeDown && (
            <Button
              role="button"
              className="col-start-3 opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel="Merge Down"
              onClick={handleMergeDown}
              type="button"
            >
              <ArrowDown size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 items-center">
        <div className="flex flex-1">
          <span className="w-full">
            {line
              .replace(/\[(.*?)\]/, "")
              .replace(/\((.*?)\)/, "")
              .replace(/(.*?):/, "")}
          </span>
        </div>
      </div>
    </>
  )
}

type SentenceFormProps = {
  id: string
  line: string
  onChange: (line: string) => void
}

const SentenceForm = ({ id, line, onChange }: SentenceFormProps): JSX.Element => {
  const [input, setInput] = useState(line)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value)
  }, [])

  const handleBlur = useCallback((): void => {
    onChange(input)
  }, [input, onChange])

  return (
    <Field name={`sentence_${id}`} asChild>
      <Control asChild>
        <Textarea
          className={"w-full rounded-md border-2 p-2"}
          value={input}
          autoFocus
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      </Control>
    </Field>
  )
}
