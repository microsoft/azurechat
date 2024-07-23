"use client"

import { Form } from "@radix-ui/react-form"
import { uniqueId } from "docx"
import { useEffect, useState, useCallback } from "react"

import { Button } from "@/features/ui/button"

import { TranscriptSentence } from "./transcript-sentence"
import { Sentence, Speaker } from "./types"

const defaultBackgrounds = ["bg-background", "bg-altBackground"]

type TranscriptFormProps = {
  initialContent: string[]
  onChange: (value: string[]) => void
}

export const TranscriptForm = ({ initialContent, onChange }: TranscriptFormProps): JSX.Element => {
  const [formValue, setFormValue] = useState<Sentence[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])

  useEffect(() => {
    const initialFormValue = initialContent.filter(line => line.trim()).map((line, index) => ({ line, id: `${index}` }))
    const initialSpeakers = initialContent.reduce((acc, curr) => {
      const speakerName = curr.match(/\[(.*?)\]/)?.[1] || curr.match(/\((.*?)\)/)?.[1] || curr.match(/(.*?):/)?.[1]
      if (!speakerName) return acc
      if (!acc.find(s => s.name === speakerName)) {
        const newSpeaker = {
          name: speakerName || `Speaker ${acc.length + 1}`,
          id: acc.length,
        }
        acc.push(newSpeaker)
      }
      return acc
    }, [] as Speaker[])

    setFormValue(initialFormValue)
    setSpeakers(initialSpeakers)
  }, [initialContent])

  const handleChange = useCallback(
    (newFormValue: Sentence[]): void => {
      setFormValue(newFormValue)
      const newSpeakers = newFormValue.reduce((acc, curr) => {
        const speakerName =
          curr.line.match(/\[(.*?)\]/)?.[1] || curr.line.match(/\((.*?)\)/)?.[1] || curr.line.match(/(.*?):/)?.[1]
        if (!speakerName) return acc
        if (!acc.find(s => s.name === speakerName)) {
          const newSpeaker = {
            name: speakerName || `Speaker ${acc.length + 1}`,
            id: acc.length,
          }
          acc.push(newSpeaker)
        }
        return acc
      }, [] as Speaker[])
      setSpeakers(newSpeakers)
      onChange(newFormValue.map(s => s.line))
    },
    [onChange]
  )

  const handleSentenceChange = useCallback(
    (id: string, updatedSentence: Sentence): void => {
      const itemIndex = formValue.findIndex(sentence => sentence.id === id)
      const linesToAdd = updatedSentence.line
        .split("\n")
        .filter(line => line.trim())
        .map(line => ({ line, id: uniqueId() }))
      const newFormValue = formValue.reduce((acc, curr, index) => {
        if (index === itemIndex) acc.push(...linesToAdd)
        else acc.push(curr)
        return acc
      }, [] as Sentence[])
      handleChange(newFormValue)
    },
    [formValue, handleChange]
  )

  const handleMergeUp = useCallback(
    (id: string) => (): void => {
      const itemIndex = formValue.findIndex(sentence => sentence.id === id)
      const prevItemIndex = Math.max(itemIndex - 1, 0)
      const lineToConcat = formValue[itemIndex].line
        .replace(/\[(.*?)\]/, "")
        .replace(/\((.*?)\)/, "")
        .replace(/(.*?):/, "")
      const lineToAdd = {
        ...formValue[prevItemIndex],
        line: `${formValue[prevItemIndex].line} ${lineToConcat}`,
      }
      const newFormValue = formValue.reduce((acc, curr, index) => {
        if (index === prevItemIndex) acc.push(lineToAdd)
        else if (index !== itemIndex) acc.push(curr)
        return acc
      }, [] as Sentence[])
      handleChange(newFormValue)
    },
    [formValue, handleChange]
  )

  const handleMergeDown = useCallback(
    (id: string) => (): void => {
      const itemIndex = formValue.findIndex(sentence => sentence.id === id)
      const nextItemIndex = Math.min(itemIndex + 1, formValue.length - 1)
      const lineToConcat = formValue[nextItemIndex].line
        .replace(/\[(.*?)\]/, "")
        .replace(/\((.*?)\)/, "")
        .replace(/(.*?):/, "")
      const lineToAdd = {
        ...formValue[itemIndex],
        line: `${formValue[itemIndex].line} ${lineToConcat}`,
      }
      const newFormValue = formValue.reduce((acc, curr, index) => {
        if (index === itemIndex) acc.push(lineToAdd)
        else if (index !== nextItemIndex) acc.push(curr)
        return acc
      }, [] as Sentence[])
      handleChange(newFormValue)
    },
    [formValue, handleChange]
  )

  const prefillSpeakers = useCallback((): void => {
    const speakers = [
      {
        name: "Speaker 1",
        id: 0,
      },
      {
        name: "Speaker 2",
        id: 1,
      },
    ]

    const newFormValue = formValue.map((sentence, index) => {
      const speaker = speakers[index % speakers.length]
      return { ...sentence, speaker, line: `[${speaker.name}] ${sentence.line}` }
    })
    handleChange(newFormValue)
  }, [formValue, handleChange])

  return (
    <Form className="flex size-full flex-col">
      {!speakers.length && (
        <div className="flex justify-end p-2">
          <Button variant={"default"} className="p-2" onClick={prefillSpeakers} ariaLabel="prefill speakers">
            Prefill&nbsp;speakers
          </Button>
        </div>
      )}
      <div>
        {formValue.map((item, index) => (
          <TranscriptSentence
            key={item.id}
            id={item.id}
            sentence={item}
            speaker={speakers.find(s => item.line.includes(s.name)) || speakers[0]}
            background={defaultBackgrounds[index % defaultBackgrounds.length]}
            onChange={update => handleSentenceChange(item.id, update)}
            onMergeUp={index ? handleMergeUp(item.id) : undefined}
            onMergeDown={index !== formValue.length - 1 ? handleMergeDown(item.id) : undefined}
          />
        ))}
      </div>
    </Form>
  )
}
