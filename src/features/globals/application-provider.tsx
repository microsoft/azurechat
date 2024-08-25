"use client"
import { createContext, PropsWithChildren, useContext, useEffect, useReducer } from "react"

import { APP_NAME, APP_DESCRIPTION, APP_VERSION } from "@/app-global"

import logger from "@/features/insights/app-insights"
import { ApplicationSettings } from "@/features/models/application-models"
import { ActionBase } from "@/lib/utils"

type ContextDefinition = ReturnType<typeof useApplicationHook>
const ApplicationContext = createContext<ContextDefinition | null>(null)
const DEFAULT_APPLICATION_SETTINGS: ApplicationSettings = {
  id: process.env.APPLICATION_ID || "",
  name: APP_NAME,
  description: APP_DESCRIPTION,
  version: APP_VERSION,
  termsAndConditionsDate: new Date().toISOString(),
}

const useApplicationHook = (settings?: ApplicationSettings): State => {
  const [state, dispatch] = useReducer(applicationReducer, initialState)

  useEffect(() => {
    if (!settings)
      fetch("/api/application", { method: "GET" })
        .then(async response => {
          if (!response.ok) throw new Error("Error fetching application settings")
          const result = await response.json()
          dispatch({ type: "SET_APP_SETTINGS", payload: result })
        })
        .catch(error => {
          logger.error("Error fetching application settings", { error })
          dispatch({ type: "SET_APP_SETTINGS", payload: DEFAULT_APPLICATION_SETTINGS })
        })
    else dispatch({ type: "SET_APP_SETTINGS", payload: settings })
  }, [settings])

  return { ...state }
}

export const useApplication = (): ContextDefinition => {
  const contextValue = useContext(ApplicationContext)
  if (contextValue === null) throw Error("ApplicationContext has not been Provided!")
  return contextValue
}

type ApplicationProviderProps = {
  settings?: ApplicationSettings
}
export default function ApplicationProvider({
  settings,
  children,
}: PropsWithChildren<ApplicationProviderProps>): JSX.Element {
  const value = useApplicationHook(settings)
  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

const initialState: State = {
  appSettings: DEFAULT_APPLICATION_SETTINGS,
}

type State = {
  appSettings: ApplicationSettings
}

function applicationReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_APP_SETTINGS": {
      return {
        ...state,
        appSettings: action.payload,
      }
    }
    default:
      return state
  }
}

type ACTION = ActionBase<"SET_APP_SETTINGS", { payload: ApplicationSettings }>
