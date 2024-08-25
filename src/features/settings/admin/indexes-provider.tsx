"use client"

import { PropsWithChildren, createContext, useContext, useReducer } from "react"

import { IndexModel } from "@/features/models/index-models"
import { ActionBase } from "@/lib/utils"

type IndexesContextDefinition = ReturnType<typeof useIndexesContextHook>
const IndexesContext = createContext<IndexesContextDefinition | null>(null)

const useIndexesContextHook = ({ indexes }: IndexesProviderProps): State => {
  const [state, dispatch] = useReducer(indexesReducer, {
    indexes: indexes,
    setIndexes: indexes => dispatch({ type: "SET_INDEXES", payload: indexes }),
    setIndex: index => dispatch({ type: "SET_INDEX", payload: index }),
  })
  return { ...state }
}

export const useIndexesContext = (): IndexesContextDefinition => {
  const context = useContext(IndexesContext)
  if (!context) throw new Error("IndexesContext hasn't been provided!")
  return context
}

type IndexesProviderProps = {
  indexes: IndexModel[]
}
export default function IndexesProvider({ children, ...props }: PropsWithChildren<IndexesProviderProps>): JSX.Element {
  const value = useIndexesContextHook(props)
  return <IndexesContext.Provider value={value}>{children}</IndexesContext.Provider>
}

type State = {
  indexes: IndexModel[]
  setIndexes: (indexes: IndexModel[]) => void
  setIndex: (index: IndexModel) => void
}

function indexesReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_INDEXES":
      return { ...state, indexes: action.payload }
    case "SET_INDEX":
      return {
        ...state,
        indexes: state.indexes.reduce((acc, curr) => {
          if (curr.id === action.payload.id) return [...acc, action.payload]
          return [...acc, curr]
        }, [] as IndexModel[]),
      }
    default:
      return state
  }
}

type ACTION = ActionBase<"SET_INDEXES", { payload: IndexModel[] }> | ActionBase<"SET_INDEX", { payload: IndexModel }>
