import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useReducer } from "react"

import { calculateAccuracy } from "@/lib/calculate-accuracy"
import { ActionBase } from "@/lib/utils"

import { Speaker } from "./types"

type State = {
  originalContent: string
  lastSavedContent: string
  content: string
  sentences: string[]
  accuracy: number
  editorType: "text" | "form"
  onContentChange: (value: string) => void
  onSentencesChange: (value: string[]) => void
  switchEditor: (editor: "text" | "form") => void
  reset: () => void
  undo: () => void
  save: () => void
  prefillSpeakers: () => void
  speakers: Speaker[]
}

function useTranscriptEditorContextHook({ originalContent, updatedContent }: TranscriptEditorProviderProps): State {
  const content = (updatedContent || originalContent || "").trim()
  const sentences = content.split("\n").filter(Boolean)
  const [state, dispatch] = useReducer(TranscriptEditorReducer, {
    originalContent: originalContent || "",
    lastSavedContent: content,
    content,
    sentences,
    accuracy: calculateAccuracy(originalContent || "", content),
    editorType: "form",
    onContentChange: useCallback((value: string) => dispatch({ type: "CONTENT_CHANGE", payload: value }), []),
    onSentencesChange: useCallback((value: string[]) => dispatch({ type: "SENTENCES_CHANGE", payload: value }), []),
    switchEditor: useCallback((editor: "text" | "form") => dispatch({ type: "EDITOR_CHANGE", payload: editor }), []),
    reset: useCallback(() => dispatch({ type: "RESET" }), []),
    undo: useCallback(() => dispatch({ type: "UNDO" }), []),
    save: useCallback(() => dispatch({ type: "SAVE" }), []),
    prefillSpeakers: useCallback(() => dispatch({ type: "PREFILL_SPEAKERS" }), []),
    speakers: speakersFactory(sentences),
  })

  return useMemo(() => ({ ...state }), [state])
}

type TranscriptEditorContextDefinition = ReturnType<typeof useTranscriptEditorContextHook>
const TranscriptEditorContext = createContext<TranscriptEditorContextDefinition | null>(null)

type TranscriptEditorProviderProps = {
  originalContent: string | undefined | null
  updatedContent: string | undefined | null
}
export default function TranscriptEditorProvider({
  originalContent,
  updatedContent,
  children,
}: PropsWithChildren<TranscriptEditorProviderProps>): JSX.Element {
  const value = useTranscriptEditorContextHook({ originalContent, updatedContent })
  return <TranscriptEditorContext.Provider value={value}>{children}</TranscriptEditorContext.Provider>
}

export function useTranscriptEditor(): TranscriptEditorContextDefinition {
  const contextValue = useContext(TranscriptEditorContext)
  if (contextValue === null) throw Error("TranscriptEditorContext has not been Provided!")
  return contextValue
}

type ACTION =
  | ActionBase<"CONTENT_CHANGE", { payload: string }>
  | ActionBase<"SENTENCES_CHANGE", { payload: string[] }>
  | ActionBase<"EDITOR_CHANGE", { payload: "text" | "form" }>
  | ActionBase<"RESET">
  | ActionBase<"UNDO">
  | ActionBase<"SAVE">
  | ActionBase<"SET_SPEAKERS", { payload: { name: string; id: number }[] }>
  | ActionBase<"PREFILL_SPEAKERS">

function TranscriptEditorReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "CONTENT_CHANGE": {
      return {
        ...state,
        content: action.payload,
        sentences: action.payload.split("\n"),
        accuracy: calculateAccuracy(state.originalContent, action.payload),
        speakers: speakersFactory(action.payload.split("\n")),
      }
    }
    case "SENTENCES_CHANGE": {
      return {
        ...state,
        content: action.payload.join("\n"),
        sentences: action.payload,
        accuracy: calculateAccuracy(state.originalContent, action.payload.join("\n")),
        speakers: speakersFactory(action.payload),
      }
    }
    case "EDITOR_CHANGE": {
      return {
        ...state,
        editorType: action.payload,
      }
    }
    case "RESET": {
      return {
        ...state,
        content: state.originalContent,
        sentences: state.originalContent.split("\n"),
        accuracy: calculateAccuracy(state.originalContent, state.originalContent),
        speakers: speakersFactory(state.originalContent.split("\n")),
      }
    }
    case "UNDO": {
      return {
        ...state,
        content: state.lastSavedContent,
        sentences: state.lastSavedContent.split("\n"),
        accuracy: calculateAccuracy(state.originalContent, state.lastSavedContent),
        speakers: speakersFactory(state.lastSavedContent.split("\n")),
      }
    }
    case "SAVE": {
      return {
        ...state,
        lastSavedContent: state.content,
      }
    }
    case "PREFILL_SPEAKERS": {
      const speakers = ["Speaker 1", "Speaker 2"]
      const newSentences = state.sentences.reduce((acc, curr) => {
        if (!curr.trim()) return acc
        const speaker = speakers[acc.length % speakers.length]
        acc.push(`[${speaker}] ${curr}`)
        return acc
      }, [] as string[])

      return {
        ...state,
        content: newSentences.join("\n"),
        sentences: newSentences,
        speakers: speakersFactory(newSentences),
      }
    }
    default:
      return state
  }
}

const defaultBackgrounds = ["bg-background", "bg-altBackground"]
export const speakersFactory = (content: string[]): Speaker[] =>
  content.reduce((acc, curr) => {
    const speakerName = curr.match(/\[(.*?)\]/)?.[1] || curr.match(/\((.*?)\)/)?.[1] || curr.match(/(.*?):/)?.[1]
    if (!speakerName) return acc
    if (!acc.find(s => s.name === speakerName)) {
      const newSpeaker = {
        name: speakerName || `Speaker ${acc.length + 1}`,
        id: acc.length,
        background: defaultBackgrounds[acc.length % defaultBackgrounds.length],
      }
      acc.push(newSpeaker)
    }
    return acc
  }, [] as Speaker[])
