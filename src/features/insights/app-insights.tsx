import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js"
import { ReactPlugin } from "@microsoft/applicationinsights-react-js"
import { ApplicationInsights, IConfiguration } from "@microsoft/applicationinsights-web"
import { createBrowserHistory } from "history"

import { IAppInsightsContext } from "./app-insights-context"

type EventProperties = Record<string, unknown>

export const createAppInsights = (): IAppInsightsContext | null => {
  if (typeof window === "undefined") {
    console.warn("Application Insights cannot be initialized server-side.")
    return null
  }

  try {
    const browserHistory = createBrowserHistory()
    const reactPlugin = new ReactPlugin()
    const clickPlugin = new ClickAnalyticsPlugin()
    const appInsightsKey = process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING

    if (!appInsightsKey) {
      throw new Error("Connection string for Application Insights is undefined or empty.")
    }

    const config: IConfiguration = {
      connectionString: appInsightsKey,
      extensions: [reactPlugin, clickPlugin],
      extensionConfig: {
        [clickPlugin.identifier]: { autoCapture: true },
        [reactPlugin.identifier]: { history: browserHistory },
      },
    }

    const appInsights = new ApplicationInsights({ config })
    appInsights.loadAppInsights()
    appInsights.trackPageView()

    return {
      appInsights,
      reactPlugin,
      browserHistory,
      clickPlugin,
      logEvent: (name: string, properties?: EventProperties) => {
        appInsights.trackEvent({ name }, properties)
      },
      logError: (error: Error, properties?: EventProperties) => {
        appInsights.trackException({ exception: error, properties })
      },
      logInfo: (message: string, properties?: EventProperties) => {
        appInsights.trackTrace({ message, properties })
      },
    }
  } catch (error) {
    console.error("Failed to initialize Application Insights", error)
    return null
  }
}
