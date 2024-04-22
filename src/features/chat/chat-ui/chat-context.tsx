"use client"

import { ChatRequestOptions, JSONValue, Message } from "ai"
import { UseChatHelpers, useChat } from "ai/react"
import { useRouter } from "next/navigation"
import React, { FC, FormEvent, createContext, useContext, useRef, useState } from "react"

import { MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED } from "@/features/chat/chat-services/chat-api"
import {
  ChatThreadModel,
  ChatType,
  ConversationStyle,
  ConversationSensitivity,
  PromptBody,
  PromptMessage,
  ChatRole,
  AssistantChatMessageModel,
  UserChatMessageModel,
  ChatDocumentModel,
} from "@/features/chat/models"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { uniqueId } from "@/lib/utils"

import { FileState, useFileState } from "./chat-file/use-file-state"
import { SpeechToTextProps, useSpeechToText } from "./chat-speech/use-speech-to-text"
import { TextToSpeechProps, useTextToSpeech } from "./chat-speech/use-text-to-speech"

interface ChatContextProps extends UseChatHelpers {
  id: string
  setChatBody: (body: PromptBody) => void
  chatBody: PromptBody
  fileState: FileState
  onChatTypeChange: (value: ChatType) => void
  onConversationStyleChange: (value: ConversationStyle) => void
  onConversationSensitivityChange: (value: ConversationSensitivity) => void
  speech: TextToSpeechProps & SpeechToTextProps
  isModalOpen?: boolean
  openModal?: () => void
  closeModal?: () => void
  offenderId?: string
  chatThreadLocked: boolean
  messages: PromptMessage[]
  documents: ChatDocumentModel[]
}

const ChatContext = createContext<ChatContextProps | null>(null)
interface Prop {
  children: React.ReactNode
  id: string
  chats: Array<UserChatMessageModel | AssistantChatMessageModel>
  chatThread: ChatThreadModel
  documents: ChatDocumentModel[]
  offenderId?: string
  chatThreadName?: ChatThreadModel["name"]
}

export const ChatProvider: FC<Prop> = props => {
  const { showError } = useGlobalMessageContext()
  const Router = useRouter()
  const speechSynthesizer = useTextToSpeech()
  const speechRecognizer = useSpeechToText({
    onSpeech(value) {
      response.setInput(value)
    },
  })

  const fileState = useFileState()

  const [chatBody, setChatBody] = useState<PromptBody>({
    id: props.chatThread.id,
    chatType: props.chatThread.chatType,
    conversationStyle: props.chatThread.conversationStyle,
    conversationSensitivity: props.chatThread.conversationSensitivity,
    chatOverFileName: props.chatThread.chatOverFileName,
    tenantId: props.chatThread.tenantId,
    userId: props.chatThread.userId,
    offenderId: props.chatThread.offenderId,
    chatThreadName: props.chatThread.name,
  })

  const { textToSpeech } = speechSynthesizer
  const { isMicrophoneUsed, resetMicrophoneUsed } = speechRecognizer

  const onError = (error: Error): void => showError(error.message)

  const [nextId, setNextId] = useState<string | undefined>(undefined)
  const nextIdRef = useRef(nextId)
  nextIdRef.current = nextId

  const response = useChat({
    onError,
    id: props.id,
    body: chatBody,
    initialMessages: props.chats,
    onFinish: (lastMessage: Message) => {
      if (isMicrophoneUsed) {
        textToSpeech(lastMessage.content)
        resetMicrophoneUsed()
      }
      Router.refresh()
    },
    generateId: () => {
      if (nextIdRef.current) {
        const returnValue = nextIdRef.current
        setNextId(undefined)
        return returnValue
      }

      return uniqueId()
    },
    sendExtraMessageFields: true,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = (): void => setIsModalOpen(true)
  const closeModal = (): void => setIsModalOpen(false)

  const onChatTypeChange = (value: ChatType): void => {
    fileState.setIsFileNull(true)
    setChatBody(prev => ({ ...prev, chatType: value }))
  }

  const onConversationStyleChange = (value: ConversationStyle): void =>
    setChatBody(prev => ({ ...prev, conversationStyle: value }))

  const onConversationSensitivityChange = (value: ConversationSensitivity): void =>
    setChatBody(prev => ({ ...prev, conversationSensitivity: value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, options: ChatRequestOptions = {}): Promise<void> => {
    e.preventDefault()
    if (!response.input) return

    const nextCompletionId = uniqueId()
    setNextId(nextCompletionId)

    await response.append(
      {
        id: uniqueId(),
        content: response.input,
        role: ChatRole.User,
      },
      { ...options, data: { completionId: nextCompletionId } }
    )

    response.setInput("")
  }

  return (
    <ChatContext.Provider
      value={{
        ...response,
        messages: response.messages.map<PromptMessage>(message => {
          const dataItem = (response.data as (JSONValue & PromptMessage)[])?.find(
            data => data?.id === message.id
          ) as PromptMessage
          return {
            ...message,
            ...dataItem,
          }
        }),
        documents: props.documents,
        chatThreadLocked:
          (props.chatThread?.contentFilterTriggerCount || 0) >= MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED,
        handleSubmit,
        setChatBody,
        chatBody,
        onChatTypeChange,
        onConversationStyleChange,
        onConversationSensitivityChange,
        fileState,
        id: props.id,
        speech: {
          ...speechSynthesizer,
          ...speechRecognizer,
        },
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  )
}

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("ChatContext is null")
  }
  return context
}
