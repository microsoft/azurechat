"use client"

import { Form } from "@radix-ui/react-form"
import { uniqueId } from "docx"
import { useEffect, useState } from "react"

import { speakersFactory, useTranscriptEditor } from "./transcript-editor-provider"
import { TranscriptSentence } from "./transcript-sentence"
import { Sentence } from "./types"

export const TranscriptForm = (): JSX.Element => {
  const { sentences, onSentencesChange, speakers } = useTranscriptEditor()
  const [formValue, setFormValue] = useState<Sentence[]>(formValueFactory(sentences))

  useEffect(() => {
    setFormValue(formValueFactory(sentences))
  }, [sentences])

  const handleChange = (newFormValue: Sentence[]): void => {
    setFormValue(newFormValue)
    onSentencesChange(newFormValue.map(s => s.line))
  }

  const handleSentenceChange = (id: string, updatedSentence: Sentence): void => {
    const newFormValue = sentenceChange(formValue, id, updatedSentence)
    handleChange(newFormValue)
  }

  const handleMergeUp = (id: string) => (): void => {
    const newFormValue = mergeUp(formValue, id)
    handleChange(newFormValue)
  }

  const handleMergeDown = (id: string) => (): void => {
    const newFormValue = mergeDown(formValue, id)
    handleChange(newFormValue)
  }

  return (
    <Form className="flex size-full flex-col">
      {formValue.map((item, index) => (
        <TranscriptSentence
          key={item.id}
          id={item.id}
          sentence={item}
          speaker={speakers.find(s => item.line.includes(s.name)) || speakers[0]}
          onChange={update => handleSentenceChange(item.id, update)}
          onMergeUp={index ? handleMergeUp(item.id) : undefined}
          onMergeDown={index !== formValue.length - 1 ? handleMergeDown(item.id) : undefined}
        />
      ))}
    </Form>
  )
}

const formValueFactory = (initialContent: string[]): Sentence[] =>
  initialContent.filter(line => line.trim()).map((line, index) => ({ line, id: `${index}` }))

const removeSpeaker = (line: string): string =>
  line
    .trim()
    .replace(/\[(.*?)\]/, "")
    .replace(/\((.*?)\)/, "")
    .replace(/(.*?):/, "")

function sentenceChange(formValue: Sentence[], id: string, updatedSentence: Sentence): Sentence[] {
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
  return newFormValue
}

function mergeDown(formValue: Sentence[], id: string): Sentence[] {
  const itemIndex = formValue.findIndex(sentence => sentence.id === id)
  const nextItemIndex = Math.min(itemIndex + 1, formValue.length - 1)
  const nextSpeaker = speakersFactory([formValue[nextItemIndex].line])[0]?.name || ""
  const newSentence =
    `[${nextSpeaker}] ${removeSpeaker(formValue[itemIndex].line).trim()}` +
    `${removeSpeaker(formValue[nextItemIndex].line.trim())}`
  const lineToAdd = { ...formValue[itemIndex], line: newSentence }
  const newFormValue = formValue.reduce((acc, curr, index) => {
    if (index === itemIndex) acc.push(lineToAdd)
    else if (index !== nextItemIndex) acc.push(curr)
    return acc
  }, [] as Sentence[])
  return newFormValue
}

function mergeUp(formValue: Sentence[], id: string): Sentence[] {
  const itemIndex = formValue.findIndex(sentence => sentence.id === id)
  const prevItemIndex = Math.max(itemIndex - 1, 0)
  const lineToConcat = removeSpeaker(formValue[itemIndex].line)
  const lineToAdd = {
    ...formValue[prevItemIndex],
    line: `${formValue[prevItemIndex].line} ${lineToConcat}`,
  }
  const newFormValue = formValue.reduce((acc, curr, index) => {
    if (index === prevItemIndex) acc.push(lineToAdd)
    else if (index !== itemIndex) acc.push(curr)
    return acc
  }, [] as Sentence[])
  return newFormValue
}
