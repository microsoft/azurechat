"use client"

import { PropsWithChildren, createContext, useContext } from "react"

import { TenantConfig } from "@/features/models/tenant-models"

type SettingsContextDefinition = {
  config: TenantConfig
}

const SettingsContext = createContext<SettingsContextDefinition | undefined>(undefined)

function useSettingsContextHook(config: TenantConfig): SettingsContextDefinition {
  return { config }
}

export const useSettingsContext = (): SettingsContextDefinition => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("SettingsContext hasn't been provided!")
  return context
}

export default function SettingsProvider({
  children,
  config,
}: PropsWithChildren<SettingsContextDefinition>): JSX.Element | null {
  const value = useSettingsContextHook(config)

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
