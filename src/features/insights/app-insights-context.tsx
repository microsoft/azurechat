import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js"
import { ReactPlugin } from "@microsoft/applicationinsights-react-js"
import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { History } from "history"
import { createContext, useContext } from "react"

export interface IAppInsightsContext {
  appInsights: ApplicationInsights | undefined
  reactPlugin: ReactPlugin | undefined
  browserHistory: History | undefined
  clickPlugin: ClickAnalyticsPlugin | undefined
  logEvent: (name: string, properties?: Record<string, unknown>) => void
  logError: (error: Error, properties?: Record<string, unknown>) => void
  logInfo: (message: string, properties?: Record<string, unknown>) => void
}

const defaultLogFunction = (): void => {
  // eslint-disable-next-line no-console
  console.warn("Application Insights is not initialized.")
}

export const defaultContextValue: IAppInsightsContext = {
  appInsights: undefined,
  reactPlugin: undefined,
  browserHistory: undefined,
  clickPlugin: undefined,
  logEvent: defaultLogFunction,
  logError: defaultLogFunction,
  logInfo: defaultLogFunction,
}

export const AppInsightsContext = createContext<IAppInsightsContext>(defaultContextValue)

export const useAppInsightsContext = (): IAppInsightsContext => {
  const context = useContext(AppInsightsContext)
  if (context === null) {
    throw new Error("useAppInsightsContext must be used within an AppInsightsProvider")
  }
  return context
}
