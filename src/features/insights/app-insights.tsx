import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js"
import { SeverityLevel } from "@microsoft/applicationinsights-common"
import { ApplicationInsights } from "@microsoft/applicationinsights-web"

type CustomProperties = { [key: string]: unknown }

let appInsights: ApplicationInsights

const createTelemetryService = (): {
  appInsights: ApplicationInsights
  initialize: (connectionString: string) => void
} => {
  const initialize = (connectionString: string): void => {
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true,
        disableFetchTracking: false,
        enableAjaxErrorStatusText: true,
        enableUnhandledPromiseRejectionTracking: true,
        extensionConfig: {
          [new ClickAnalyticsPlugin().identifier]: { autoCapture: true },
        },
      },
    })

    appInsights.loadAppInsights()

    appInsights.addTelemetryInitializer(telemetry => {
      if (telemetry?.baseType === "PageviewData" && telemetry?.baseData?.refUri === telemetry?.baseData?.uri)
        return false
      if (telemetry?.baseData?.type === "Fetch" && telemetry?.baseData?.success) return false
      return true
    })
  }

  return {
    appInsights,
    initialize,
  }
}

const info = (message: string, customProperties?: CustomProperties): void => {
  const telemetry = {
    message,
    severityLevel: SeverityLevel.Information,
  }
  appInsights?.trackTrace(telemetry, customProperties)
}

const warning = (message: string, customProperties?: CustomProperties): void => {
  const telemetry = {
    message,
    severityLevel: SeverityLevel.Warning,
  }
  appInsights?.trackTrace(telemetry, customProperties)
}

const error = (message: string, customProperties?: CustomProperties): void => {
  const telemetry = {
    message,
    severityLevel: SeverityLevel.Error,
  }
  appInsights?.trackTrace(telemetry, customProperties)
}

type CriticalErrorPayload = {
  message: string
  stacktrace: string
  token: string
}

const critical = (message: string, customProperties: CriticalErrorPayload & CustomProperties): void => {
  const telemetry = {
    message,
    severityLevel: SeverityLevel.Critical,
  }
  appInsights?.trackTrace(telemetry, customProperties)
}

const event = (name: string, customProperties?: CustomProperties): void => {
  const telemetry = {
    name,
    properties: customProperties,
  }
  appInsights?.trackEvent(telemetry)
}

const logger = {
  info,
  warning,
  error,
  critical,
  event,
}

export const applicationInsights = createTelemetryService()
export default logger
