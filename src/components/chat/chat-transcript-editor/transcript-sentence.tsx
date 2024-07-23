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
  background: string
  onChange: (sentence: Sentence) => void
  onMergeUp?: () => void
  onMergeDown?: () => void
}

export const TranscriptSentence = ({
  sentence,
  speaker,
  background,
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
      className={`${background} group flex cursor-pointer items-start gap-2 rounded-sm border-2 border-transparent p-2 hover:border-accent`}
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

  const handleMergeUpClick = useCallback((): void => {
    if (onMergeUp) {
      onMergeUp()
    }
  }, [onMergeUp])

  const handleMergeDownClick = useCallback((): void => {
    if (onMergeDown) {
      onMergeDown()
    }
  }, [onMergeDown])

  return (
    <>
      <div className={`flex flex-col ${speaker ? "gap-2" : ""}`}>
        {speaker && <b className="text-nowrap">{speaker.name}</b>}
        <div className="grid grid-cols-3 gap-1">
          {onMergeUp ? (
            <Button
              className="opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel="Merge Up"
              onClick={handleMergeUpClick}
            >
              <ArrowUp size={16} />
            </Button>
          ) : (
            <div />
          )}
          <Button
            className="opacity-20 group-hover:opacity-100"
            size="sm"
            variant="accent"
            ariaLabel="Edit"
            onClick={switchToEdit}
          >
            <Pencil size={16} />
          </Button>
          {onMergeDown ? (
            <Button
              className="opacity-20 group-hover:opacity-100"
              size="sm"
              variant="accent"
              ariaLabel="Merge Down"
              onClick={handleMergeDownClick}
            >
              <ArrowDown size={16} />
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
      <div className="flex flex-1 items-center">
        <div className="flex flex-1">
          <span className="w-full">{line.replace(/\[(.*?)\]/, "").replace(/\((.*?)\)/, "")}</span>
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
