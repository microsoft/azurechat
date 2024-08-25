"use client"

import { PropsWithChildren, createContext, useContext, useReducer } from "react"

import { SmartToolModel } from "@/features/models/smart-tool-models"
import { ActionBase } from "@/lib/utils"

type SmartToolsContextDefinition = ReturnType<typeof useSmartToolsContextHook>
const SmartToolsContext = createContext<SmartToolsContextDefinition | null>(null)

const useSmartToolsContextHook = ({ smartTools }: SmartToolsProviderProps): State => {
  const [state, dispatch] = useReducer(smartToolsReducer, {
    smartTools,
    setSmartTools: smartTools => dispatch({ type: "SET_SMART_TOOLS", payload: smartTools }),
    setSmartTool: smartTool => dispatch({ type: "SET_SMART_TOOL", payload: smartTool }),
  })
  return { ...state }
}

export const useSmartToolsContext = (): SmartToolsContextDefinition => {
  const context = useContext(SmartToolsContext)
  if (!context) throw new Error("SmartToolsContext hasn't been provided!")
  return context
}

type SmartToolsProviderProps = {
  smartTools: SmartToolModel[]
}
export default function SmartToolsProvider({
  children,
  ...props
}: PropsWithChildren<SmartToolsProviderProps>): JSX.Element {
  const value = useSmartToolsContextHook(props)
  return <SmartToolsContext.Provider value={value}>{children}</SmartToolsContext.Provider>
}

type State = {
  smartTools: SmartToolModel[]
  setSmartTools: (smartTools: SmartToolModel[]) => void
  setSmartTool: (smartTool: SmartToolModel) => void
}

function smartToolsReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_SMART_TOOLS":
      return { ...state, smartTools: action.payload }
    case "SET_SMART_TOOL":
      return {
        ...state,
        smartTools: state.smartTools.reduce((acc, curr) => {
          if (curr.id === action.payload.id) return [...acc, action.payload]
          return [...acc, curr]
        }, [] as SmartToolModel[]),
      }
    default:
      return state
  }
}

type ACTION =
  | ActionBase<"SET_SMART_TOOLS", { payload: SmartToolModel[] }>
  | ActionBase<"SET_SMART_TOOL", { payload: SmartToolModel }>
