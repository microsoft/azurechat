"use client"

import { PropsWithChildren, createContext, useContext, useReducer } from "react"

import { FeatureModel } from "@/features/models/feature-models"
import { ActionBase } from "@/lib/utils"

type FeaturesContextDefinition = ReturnType<typeof useFeaturesContextHook>
const FeaturesContext = createContext<FeaturesContextDefinition | null>(null)

const useFeaturesContextHook = ({ features }: FeaturesProviderProps): State => {
  const [state, dispatch] = useReducer(appAdminReducer, {
    features,
    setFeatures: features => dispatch({ type: "SET_FEATURES", payload: features }),
    setFeature: feature => dispatch({ type: "SET_FEATURE", payload: feature }),
  })
  return { ...state }
}

export const useFeaturesContext = (): FeaturesContextDefinition => {
  const context = useContext(FeaturesContext)
  if (!context) throw new Error("FeaturesContext hasn't been provided!")
  return context
}

type FeaturesProviderProps = {
  features: FeatureModel[]
}
export default function FeaturesProvider({
  children,
  ...props
}: PropsWithChildren<FeaturesProviderProps>): JSX.Element {
  const value = useFeaturesContextHook(props)
  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>
}

type State = {
  features: FeatureModel[]
  setFeatures: (features: FeatureModel[]) => void
  setFeature: (feature: FeatureModel) => void
}

function appAdminReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_FEATURES":
      return { ...state, features: action.payload }
    case "SET_FEATURE":
      return {
        ...state,
        features: state.features.reduce((acc, curr) => {
          if (curr.id === action.payload.id) return [...acc, action.payload]
          return [...acc, curr]
        }, [] as FeatureModel[]),
      }
    default:
      return state
  }
}

type ACTION =
  | ActionBase<"SET_FEATURES", { payload: FeatureModel[] }>
  | ActionBase<"SET_FEATURE", { payload: FeatureModel }>
