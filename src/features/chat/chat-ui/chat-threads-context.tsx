"use client"

import { useRouter } from "next/navigation"
import { useReducer, useContext, createContext, useEffect, PropsWithChildren } from "react"

import {
  CreateChatThread,
  FindChatThreadByTitleAndEmpty,
  SoftDeleteChatThreadForCurrentUser,
  UpdateChatThreadCreatedAt,
  UpdateChatThreadTitle,
} from "@/features/chat/chat-services/chat-thread-service"
import { ChatThreadModel } from "@/features/chat/models"
import logger from "@/features/insights/app-insights"
import { ActionBase } from "@/lib/utils"

type ChatThreadsContextDefinition = ReturnType<typeof useChatThreadsHook>
const ChatThreadsContext = createContext<ChatThreadsContextDefinition | null>(null)

const useChatThreadsHook = (threads?: ChatThreadModel[]): State => {
  const [state, dispatch] = useReducer(chatThreadsReducer, { ...initialState, threads: threads || [] })
  const router = useRouter()

  useEffect(() => {
    if (threads) return
    fetch("/api/chat/threads", { method: "GET" })
      .then(async response => {
        if (!response.ok) throw new Error("Error fetching chat threads")
        const result = await response.json()
        dispatch({ type: "SET_THREADS", payload: result })
      })
      .catch(error => {
        logger.error("Error fetching chat threads", { error })
        dispatch({ type: "SET_THREADS", payload: [] })
      })
  }, [threads])

  const updateThreadTitle = async (chatThreadId: string, name: string): Promise<void> => {
    const previousTitle = state.threads.find(thread => thread.id === chatThreadId)?.name || ""
    try {
      dispatch({ type: "UPDATE_THREAD_TITLE", payload: { chatThreadId, name } })
      const result = await UpdateChatThreadTitle(chatThreadId, name)
      if (result.status !== "OK") throw result
    } catch (error) {
      dispatch({ type: "UPDATE_THREAD_TITLE", payload: { chatThreadId, name: previousTitle } })
      logger.error("Error updating chat thread title", { error })
    }
  }

  const createThread = async (title: string): Promise<void> => {
    try {
      const existingThread = await FindChatThreadByTitleAndEmpty(title)
      if (existingThread.status !== "OK") throw existingThread

      if (!existingThread.response) {
        const newChatThread = await CreateChatThread(title)
        if (newChatThread.status !== "OK") throw newChatThread
        dispatch({ type: "CREATE_THREAD", payload: newChatThread.response })
        router.push(`/chat/${newChatThread.response.chatThreadId}`)
        return
      }

      const result = await UpdateChatThreadCreatedAt(existingThread.response.chatThreadId)
      if (result.status !== "OK") throw result
      dispatch({ type: "CREATE_THREAD", payload: result.response })
      router.push(`/chat/${result.response.chatThreadId}`)
    } catch (error) {
      logger.error("Error creating chat thread", { error })
      router.push("/chat")
    }
  }

  const removeThread = async (threadId: string): Promise<void> => {
    const thread = state.threads.find(thread => thread.id === threadId)
    if (!thread) return
    try {
      dispatch({ type: "REMOVE_THREAD", payload: threadId })
      const result = await SoftDeleteChatThreadForCurrentUser(threadId)
      if (result.status !== "OK") throw result
    } catch (error) {
      logger.error("Error deleting chat thread", { error })
      dispatch({ type: "CREATE_THREAD", payload: thread })
    }
  }

  return {
    ...state,
    updateThreadTitle,
    createThread,
    removeThread,
  }
}

export const useChatThreads = (): ChatThreadsContextDefinition => {
  const contextValue = useContext(ChatThreadsContext)
  if (contextValue === null) throw Error("ChatThreadsContext has not been Provided!")
  return contextValue
}

type ChatThreadsProviderProps = {
  threads?: ChatThreadModel[]
}

export default function ChatThreadsProvider({
  threads,
  children,
}: PropsWithChildren<ChatThreadsProviderProps>): JSX.Element {
  const value = useChatThreadsHook(threads)
  return <ChatThreadsContext.Provider value={value}>{children}</ChatThreadsContext.Provider>
}

type State = {
  threads: ChatThreadModel[]
  updateThreadTitle: (chatThreadId: string, name: string) => Promise<void>
  createThread: (title: string) => Promise<void>
  removeThread: (threadId: string) => Promise<void>
}

const initialState: State = {
  threads: [],
  updateThreadTitle: async () => {},
  createThread: async () => {},
  removeThread: async () => {},
}

function chatThreadsReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_THREADS":
      return {
        ...state,
        threads: action.payload,
      }
    case "CREATE_THREAD":
      return {
        ...state,
        threads: [action.payload, ...state.threads.filter(thread => thread.id !== action.payload.id)],
      }
    case "REMOVE_THREAD":
      return {
        ...state,
        threads: state.threads.filter(thread => thread.id !== action.payload),
      }
    case "UPDATE_THREAD_TITLE":
      return {
        ...state,
        threads: state.threads.map(thread => ({
          ...thread,
          name: thread.id === action.payload.chatThreadId ? action.payload.name : thread.name,
        })),
      }
    default:
      return state
  }
}

type ACTION =
  | ActionBase<"SET_THREADS", { payload: ChatThreadModel[] }>
  | ActionBase<"REMOVE_THREAD", { payload: string }>
  | ActionBase<"UPDATE_THREAD_TITLE", { payload: { chatThreadId: string; name: string } }>
  | ActionBase<"CREATE_THREAD", { payload: ChatThreadModel }>
