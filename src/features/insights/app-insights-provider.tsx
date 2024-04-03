import React, { useEffect, useState } from "react"

import { createAppInsights } from "./app-insights"
import { AppInsightsContext, defaultContextValue, IAppInsightsContext } from "./app-insights-context"

type AppInsightsProviderProps = {
  children: React.ReactNode
}

export const AppInsightsProvider: React.FunctionComponent<AppInsightsProviderProps> = ({ children }) => {
  const [appInsights, setAppInsights] = useState<IAppInsightsContext>(defaultContextValue)

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      const ai = await createAppInsights()
      if (ai) {
        setAppInsights(ai)
      }
    }

    initialize().catch(error => console.error("Failed to initialize AppInsights:", error))
  }, [])

  return <AppInsightsContext.Provider value={appInsights}>{children}</AppInsightsContext.Provider>
}

export default AppInsightsProvider
